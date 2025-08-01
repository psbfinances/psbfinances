'use strict'

import express from 'express'
import cuid from 'cuid'
import asyncHandler from 'express-async-handler'
import {
  AccountDb,
  AttachmentDb,
  BusinessDb,
  CategoryDb,
  DataChangeDb,
  DuplicateCandidateDb,
  TransactionDb
} from '../db/index.js'
import { transactionModel } from '../../shared/models/index.js'
import { c } from '../../shared/core/index.js'
import { AppError, getLogger } from '../core/index.js'
import DataChangeLogic, { ops } from './dataChangeLogic.js'
import utils from './utils.js'
import { config } from '../config/index.js'
import path from 'path'
import fs from 'fs'

const logger = getLogger(import.meta.url)

const controller = {
  /**
   * Gets tenant transactions by account and date range.
   * @property {AppRequest} req
   * @property {Object} req.query
   * @property {?string} req.query.accountId
   * @property {string} req.query.dateFrom
   * @property {string} req.query.dateTo
   * @property {?string} req.query.categoryId
   * @property {?string} req.query.search
   * @property {?string} req.query.importProcessId
   * @return {Array<Transaction>}
   */
  list: async (req, res) => {
    const { accountId, categoryId, businessId, dateFrom = '2000-01-01', dateTo = '2050-01-01', search, importProcessId } = req.query
    logger.info('list', { accountId, categoryId, businessId, dateFrom, dateTo, search, importProcessId })

    if (search && search.includes('q:')) return controller.listDescriptions(req, res)

    const tenantId = req.user.tenantId
    const transactionDb = new TransactionDb()
    /** @typedef {Transaction[]} */
    let result
    let criteria = Object.assign(
      { tenantId, dateFrom, dateTo },
      importProcessId ? { importProcessId } : {},
      businessId ? { businessId } : {},
      accountId && accountId !== '-1' ? { accountId } : {},
      categoryId && categoryId !== '-1' ? { categoryId } : {}
    )
    if (search) {
      criteria.search = search
      const accountDb = new AccountDb()
      const accounts = await accountDb.list(tenantId)
      criteria.accountIds = accounts.filter(x => x.visible === 1).map(x => x.id)
      result = await transactionDb.listByAccountDatesWithSearch(criteria)
    } else {
      result = await transactionDb.listByAccountDates(criteria)
      if (result.length === 0) {
        result = await transactionDb.listByAccountTopX({tenantId, accountId})
      }
    }
    if (result.length === 0) return res.json({
      items: [],
      openingBalance: 0
    })

    await controller.setDuplicateCandidates(result)
    result.forEach(x => {
      x.amount = x.amount / 100
      if (x.meta) x.meta = JSON.parse(x.meta)
    })

    const openingBalance = criteria.accountId
      ? await controller.calBalanceAndNewMonth(tenantId, accountId, dateFrom, result)
      : 0
    const data = {
      items: result,
      openingBalance
    }
    res.json(data)
  },

  /**
   * Gets children transactions for split transaction.
   * @property {AppRequest} req
   * @property {Object} req.params
   * @property {string} req.params.id
   * @return {Array<Transaction>}
   */
  listChildren: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    logger.info('listChildren', { tenantId, userId, id })

    const transactionDb = new TransactionDb()
    const items = await transactionDb.listByParentId({ tenantId, parentId: id })
    items.forEach(x => x.amount = x.amount / 100)
    res.json(items)
  },

  listAttachments: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    logger.info('listAttachments', { tenantId, userId, id })

    const attachmentDb = new AttachmentDb()
    const attachments = await attachmentDb.listByEntity(tenantId, id)
    const items = controller.getAttachmentList(attachments)
    res.json(items)
  },

  /**
   * Returns list of attachments for a transactions.
   * @param {psbf.Attachment[]} attachments
   * @return {*}
   */
  getAttachmentList: attachments => {
    return attachments.map(x => {
      const { id } = x
      const url = path.join(config.filesFolder, x.id)
      return { id, url }
    })
  },

  /**
   * Calculates running balance and new month separators.
   * @param {string} tenantId
   * @param {string} accountId
   * @param {Date} dateFrom
   * @return {Promise<number>}
   */
  calBalanceAndNewMonth: async (tenantId, accountId, dateFrom) => {
    const transactionDb = new TransactionDb()
    const accountDb = new AccountDb()

    const totalAmount = await transactionDb.aggregateAmountByAccountDates({ tenantId, accountId, dateFrom })
    const account = await accountDb.get(accountId, tenantId)
    const openingBalance = account[0].openingBalance
    return (totalAmount[0].total + openingBalance) / 100
  },

  /**
   * Sets duplicate candidate transaction id for transactions.
   * @param {Transaction[]} transactions
   * @return {Promise<void>}
   */
  setDuplicateCandidates: async transactions => {
    const duplicateCandidateDb = new DuplicateCandidateDb()
    const transactionIds = transactions.map(x => x.id)
    const duplicates = await duplicateCandidateDb.listByTransactionIds(transactionIds)
    if (duplicates.length === 0) return

    duplicates.forEach(x => {
      const index = transactions.findIndex(y => y.id === x.transactionId)
      transactions[index].duplicateCandidateId = x.duplicateId
    })
  },

  /**
   * Gets list of unique descriptions for auto-complete.
   * @property {AppRequest} req
   * @property {Object} req.query
   * @property {string} req.query.search
   * @return {Array<Transaction>}
   */
  listDescriptions: async (req, res) => {
    const { search } = req.query
    const tenantId = req.user.tenantId
    const searchDescription = search.split(':')[1]

    const transactionDb = new TransactionDb()
    const items = await transactionDb.listUniqueDescription(tenantId, searchDescription)

    const result = items.map(x => ({ description: x.description }))
    res.json(result)
  },

  /**
   * Extended transaction validation
   * @param {string} tenantId
   * @param {psbf.BasicTransactionInfo} transaction
   * @return {Promise<{valid: boolean, errors: TransactionDataError}>}
   */
  validate: async (tenantId, transaction) => {
    let { valid, errors } = transactionModel.isValid(transaction)
    if (!valid) return Promise.resolve({ valid, errors })

    const returnResult = (field, message) => {
      errors[field] = message
      return { valid: Object.keys(errors).length === 0, errors }
    }

    /** @type {psbf.Category} */
    let category
    /** @type {Business} */
    let business

    if (transaction.categoryId) {
      const categoryDb = new CategoryDb()
      const categories = await categoryDb.get(transaction.categoryId, tenantId)
      category = categories[0]
      if (!category) return returnResult('categoryId', 'Invalid category')
    }
    if (transaction.businessId && transaction.businessId !== c.PERSONAL_TYPE_ID) {
      const businessDb = new BusinessDb()
      const businesses = await businessDb.get(transaction.businessId, tenantId)
      business = businesses[0]
      if (!business) return returnResult('businessId', 'Invalid type')
    }
    if (category && category.isPersonal && transaction.businessId !== c.PERSONAL_TYPE_ID)
      return returnResult('categoryId', 'Invalid category')
    if (category && !category.isPersonal && transaction.businessId === c.PERSONAL_TYPE_ID)
      return returnResult('categoryId', 'Invalid category')

    return { valid: Object.keys(errors).length === 0, errors }
  },

  /**
   * Inserts transaction.
   * @param {AppRequest} req
   * @param {psbf.BasicTransactionInfo} req.body
   * @param {import('express').Response} res
   * @return {Promise<Transaction>}
   */
  insert: async (req, res) => {
    let { id, accountId, postedDate, description, businessId, categoryId, amount, note, tripId } = req.body
    const tenantId = req.user.tenantId
    const userId = req.user.id

    /** @type {typeof psbf.BasicTransactionInfo} */
    const transactionData = {
      id,
      tenantId,
      accountId,
      // postedDate: new Date(postedDate),
      postedDate,
      description,
      categoryId,
      businessId,
      amount: Math.round(amount * 100),
      note,
      tripId
    }
    const transaction = transactionModel.getNewManual(transactionData)
    const { valid, errors } = await controller.validate(tenantId, transaction)
    if (!valid) return utils.sendError(res, errors)

    const transactionDb = new TransactionDb()
    await transactionDb.insert(transaction)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(transactionDb.tableName, transaction.id, ops.INSERT, transaction)

    res.json(transaction)
  },

  /**
   * Update transaction.
   * @param {AppRequest} req
   * @param {psbf.Transaction} req.body
   * @param {psbf.BasicTransactionInfo[]} [req.body.childTransactions]
   * @param {import('express').Response} res
   * @return {Promise<{transaction: psbf.Transaction, childTransactions: psbf.Transaction[]}>}
   */
  update: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)

    const result = req.body.childTransactions
      ? await controller.updateSplitTransaction(tenantId, userId, id, req.body.childTransactions)
      : await controller.processUpdate(tenantId, userId, id, req.body)
    console.log('-------')
    console.log(result)
    res.json(result)
  },

  /**
   * Handles patch request.
   * @param {string} tenantId
   * @param {string} userId
   * @param {string} id
   * @param {psbf.Transaction|{scheduled: boolean, reconciled: boolean}} requestBody
   * @return {Promise<psbf.Transaction|TransactionDataError>}
   */
  async processUpdate (tenantId, userId, id, requestBody) {
    logger.debug('processUpdate', { tenantId, id, userId, requestBody })
    const transactionDb = new TransactionDb()
    const existingTransaction = await transactionDb.get(id, tenantId)
    if (!existingTransaction) throw new AppError('processUpdate', { message: 'Not found', tenantId, id, userId })

    const data = transactionModel.getChanges(existingTransaction, requestBody)
    data.id = id
    data.tenantId = tenantId

    const { valid, errors } = await controller.validate(tenantId, data)
    if (!valid) return errors

    await transactionDb.update(data)
    await controller.renameSimilarDescriptions(tenantId, userId, existingTransaction, data.description)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(transactionDb.tableName, id, ops.UPDATE, data)

    return await transactionDb.get(id, tenantId)
  },

  /**
   * @param {string} tenantId - tenant id
   * @param {string} userId - user id
   * @param {string} id - parent transaction id
   * @return {Promise<*[]>}
   */
  removeSplits: async (tenantId, userId, id) => {
    const transactionDb = new TransactionDb()
    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    const parentTransactionChanges = { hasChildren: false }
    const updatedTransaction = Object.assign({ id, tenantId }, parentTransactionChanges)
    await transactionDb.update(updatedTransaction)
    await dataChangeLogic.insert(transactionDb.tableName, id, ops.UPDATE, parentTransactionChanges)

    await transactionDb.deleteByParentId(id, tenantId)
    await dataChangeLogic.insert(transactionDb.tableName, id, ops.DELETE, { action: 'splitTransactions' })

    return []
  },

  /**
   *
   * @param {string} tenantId - tenant id
   * @param {string} userId - user id
   * @param {string} id - parent transaction id
   * @param {psbf.BasicTransactionInfo[]} childTransactions - split transactions
   * @param {psbf.Transaction} parentTransaction
   * @return {Promise<psbf.Transaction[]>}
   */
  updateSplits: async (tenantId, userId, id, childTransactions, parentTransaction) => {
    const transactionDb = new TransactionDb()
    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    /** @type {psbf.Transaction[]} */
    let transactions = []

    const childTransactionIds = childTransactions.map(x => x.id)
    const existingChildTransactions = await transactionDb.listByParentId({ tenantId, parentId: id })
    const existingChildrenTransactionIds = existingChildTransactions.map(x => x.id)

    const updatedIds = childTransactionIds.filter(x => existingChildrenTransactionIds.includes(x))
    const newIds = childTransactionIds.filter(x => !existingChildrenTransactionIds.includes(x))
    const deletedIds = existingChildrenTransactionIds.filter(x => !childTransactionIds.includes(x))

    for (const transactionId of newIds) {
      const childTransaction = childTransactions.find(x => x.id === transactionId)
      const transaction = transactionModel.getNewChild(parentTransaction, childTransaction.amount * 100, cuid(),
        tenantId, childTransaction)
      await transactionDb.insert(transaction)
      await dataChangeLogic.insert(transactionDb.tableName, transaction.id, ops.INSERT, transaction)
      transactions.push(transaction)
    }

    for (const transactionId of deletedIds) {
      const tr = childTransactions.find(x => x.id === transactionId)
      await transactionDb.delete({ id: transactionId, tenantId })
      await dataChangeLogic.insert(transactionDb.tableName, transactionId, ops.DELETE, { tr })
    }

    for (const transactionId of updatedIds) {
      const childTransaction = childTransactions.find(x => x.id === transactionId)
      const transaction = existingChildTransactions.find(x => x.id === transactionId)
      transaction.categoryId = childTransaction.categoryId
      transaction.businessId = childTransaction.businessId
      transaction.amount = childTransaction.amount * 100
      transaction.note = childTransaction.note
      const { categoryId, businessId, amount, note } = transaction

      const newData = { categoryId, businessId, amount, note }
      const data = Object.assign({ id: transactionId, tenantId }, newData)
      await transactionDb.update(data)
      await dataChangeLogic.insert(transactionDb.tableName, transactionId, ops.UPDATE, newData)
      transactions.push(transaction)
    }

    return transactions
  },

  /**
   * Adds new split transactions.
   * @param {string} tenantId - tenant id
   * @param {string} userId - user id
   * @param {string} id - parent transaction id
   * @param {psbf.Transaction} parentTransaction
   * @param {psbf.BasicTransactionInfo[]} childTransactions - split transactions
   * @return {Promise<psbf.Transaction[]>}
   */
  addSplits: async (tenantId, userId, id, childTransactions, parentTransaction) => {
    const transactionDb = new TransactionDb()
    const dataChangeLogic = new DataChangeLogic(tenantId, userId)

    const transactions = childTransactions.map(x => {
      const child = transactionModel.getNewChild(parentTransaction, x.amount * 100, cuid(), tenantId, x)
      child.categoryId = x.categoryId
      child.businessId = x.businessId
      child.note = x.note
      return child
    })

    const newData = { categoryId: null, businessId: null, hasChildren: true }
    const data = Object.assign({ id, tenantId }, newData)
    parentTransaction = Object.assign(parentTransaction, newData)
    await transactionDb.update(data)
    await dataChangeLogic.insert(transactionDb.tableName, parentTransaction.id, ops.UPDATE, newData)

    for (const child of transactions) {
      await transactionDb.insert(child)
      await dataChangeLogic.insert(transactionDb.tableName, child.id, ops.INSERT, child)
    }

    return transactions
  },

  /**
   *
   * @param {string} tenantId - tenant id
   * @param {string} userId - user id
   * @param {string} id - parent transaction id
   * @param {psbf.BasicTransactionInfo[]} childTransactions - split transactions
   * @return {Promise<{transaction: psbf.Transaction, children: psbf.Transaction[]}>}
   */
  updateSplitTransaction: async (tenantId, userId, id, childTransactions) => {
    logger.info('updateSplitTransaction', { tenantId, userId, id, childTransactions })
    const transactionDb = new TransactionDb()
    /** @type {psbf.Transaction[]} */
    let transactions

    const parentTransaction = await transactionDb.get(id, tenantId)
    if (parentTransaction.hasChildren) {
      transactions = childTransactions.length === 0
        ? await controller.removeSplits(tenantId, userId, id)
        : await controller.updateSplits(tenantId, userId, id, childTransactions, parentTransaction)
    } else {
      transactions = await controller.addSplits(tenantId, userId, id, childTransactions, parentTransaction)
    }
    console.log({ transaction: parentTransaction, children: transactions })
    return Promise.resolve({ transaction: parentTransaction, children: transactions })
  },

  /**
   * Renames all existing descriptions to the new one.
   * @param {string} tenantId
   * @param {string} userId
   * @param {psbf.Transaction} existingTransaction
   * @param {string} description
   * @return {Promise<void>}
   */
  renameSimilarDescriptions: async (tenantId, userId, existingTransaction, description) => {
    if (!Boolean(description) || existingTransaction.description === description) return Promise.resolve()

    try {
      const transactionDb = new TransactionDb()
      const oldDescription = existingTransaction.description
      const otherTransactionsWithSameDescription = await transactionDb.listByDescription(
        { tenantId, accountId: existingTransaction.accountId, description: oldDescription })

      if (otherTransactionsWithSameDescription.length === 0) return Promise.resolve()

      const ids = otherTransactionsWithSameDescription.map(x => x.id)
      await transactionDb.updateDescriptions(ids, tenantId, description)

      const entryDateTime = new Date()
      const bulkUpdateId = cuid()
      const dataChanges = otherTransactionsWithSameDescription.map(x => ({
        tenantId,
        entity: 'transactions',
        dataId: x.id,
        entryDateTime,
        operation: 'u',
        userId,
        bulkUpdateId,
        data: JSON.stringify({ description })
      }))
      const dataChangesDb = new DataChangeDb()
      await dataChangesDb.knex.insert(dataChanges)
    } catch (e) {
      logger.error('renameSimilarDescriptions', { tenantId, userId, existingTransaction, description, error: e.stack })
    }
  },

  /**
   * Deletes transaction.
   * @property {AppRequest} req
   * @property {Object} req.params
   * @property {string} req.params.id
   * @return {Array<Transaction>}
   */
  delete: async (req, res) => {
    const tenantId = req.user.tenantId
    const userId = req.user.id
    const id = req.params.id
    // TODO validate inputs

    const transactionDb = new TransactionDb()
    const transaction = await transactionDb.get(id, tenantId)
    if (!transaction) return res.status(404).json({ error: 'Cannot find transaction' })
    if (transaction.source !== c.sources.MANUAL) return res.status(405).
      json({ error: 'Cannot delete imported transaction' })

    await transactionDb.delete({ id, tenantId })
    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(transactionDb.tableName, transaction.id, ops.DELETE, transaction)

    res.json({})
  },

  /**
   * @param {AppRequest} req
   * @param {Object} req.files
   * @param {Object} req.files.attachmentFile
   * @param {e.Response} res
   * @return {Promise<Trip>}
   */
  insertAttachment: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    logger.info('insertAttachment', { id, tenantId, userId })
    if (!req.files || Object.keys(req.files).length === 0) {
      logger.info('insertAttachment', { id, tenantId, userId, error: 'missing attachment file' })
      throw new Error('No files were uploaded.')
    }

    const attachmentId = cuid()
    const importFile = req.files.attachmentFile
    const { data, ...fileInfo } = importFile
    const extension = path.extname(importFile.name)
    const internalName = `${tenantId}-${id}-${attachmentId}${extension}`

    const attachmentPath = path.resolve('../files', internalName)
    await importFile.mv(attachmentPath)

    /** @type {typeof psbf.Attachment} */
    const attachment = {
      id: attachmentId,
      tenantId,
      entityId: id,
      fileName: internalName,
      uploadedDate: new Date(),
      meta: null,
      fileInfo
    }

    const attachmentDb = new AttachmentDb()
    await attachmentDb.insert(attachment)

    await controller.updateHasAttachment(id, tenantId, true)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(attachmentDb.tableName, attachment.id, ops.INSERT, attachment)

    res.json({ id, attachmentId, url: `${config.filesFolder}${attachmentId}` })
  },

  /**
   *
   * @param {string} id transaction id
   * @param {string} tenantId
   * @param {boolean} hasAttachment
   * @return {Promise<void>}
   */
  async updateHasAttachment (id, tenantId, hasAttachment) {
    const transactionDb = new TransactionDb()
    const transaction = await transactionDb.get(id, tenantId)
    const meta = transaction.meta ? JSON.parse(transaction.meta) : {}
    meta.hasAttachment = hasAttachment
    await transactionDb.updateMeta(id, tenantId, meta)
  },

  /**
   * Handles merge manual and imported transactions request.
   * @link module:psbf/api/transactions
   * @param {AppRequest} req
   * @param {UpdateMergeRequest} req.body
   * @param {import('express').Response} res
   * @param {UpdateMergeResponse} res.body
   * @return {Promise<void>}
   */
  updateMerge: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    const mergeId = req.body.mergeId
    const result = await controller.mergeTransactions(id, tenantId, mergeId, userId)
    res.json(result)
  },

  /**
   * Merges manual and imported transactions.
   * @link module:psbf/api/transactions
   * @param {string} id first transaction id
   * @param {string} tenantId tenantId
   * @param {string} mergeId second transaction id
   * @param {string} userId
   * @return {Promise<{}|UpdateMergeResponse>}
   */
  mergeTransactions: async (id, tenantId, mergeId, userId) => {
    logger.info('mergeTransactions', { id, tenantId, mergeId })
    if (!id || !mergeId || id === mergeId) return Promise.resolve({})

    const transactionDb = new TransactionDb()
    const firstTransaction = await transactionDb.get(id, tenantId)
    if (!firstTransaction) return Promise.resolve({})
    const secondTransaction = await transactionDb.get(mergeId, tenantId)
    if (!secondTransaction) return Promise.resolve({})

    const sources = `${firstTransaction.source}${secondTransaction.source}`
    if (sources === 'mm' || sources === 'ii') return Promise.resolve({})

    const fromItem = secondTransaction.source === c.sources.MANUAL ? secondTransaction : firstTransaction
    const toItem = secondTransaction.source === c.sources.MANUAL ? firstTransaction : secondTransaction

    toItem.description = fromItem.description
    toItem.businessId = fromItem.businessId
    toItem.categoryId = fromItem.categoryId
    toItem.note = `${toItem.note} ${fromItem.note}`.trim()
    toItem.meta = null
    if (fromItem.tripId) toItem.tripId = fromItem.tripId
    const meta = controller.mergeMetas(fromItem.meta, toItem.meta)
    const dataChangeLogic = new DataChangeLogic(tenantId, userId)

    // Handle child transactions if the manual transaction has them
    if (fromItem.hasChildren) {
      const childTransactions = await transactionDb.listByParentId({ tenantId, parentId: fromItem.id })
      for (const child of childTransactions) {
        child.parentId = toItem.id
        await transactionDb.update({ id: child.id, tenantId, parentId: toItem.id })
        await dataChangeLogic.insert(transactionDb.tableName, child.id, ops.UPDATE, { parentId: toItem.id })
      }
      // Ensure the merged transaction has hasChildren flag set
      toItem.hasChildren = true
    }

    await transactionDb.delete({id: fromItem.id, tenantId})
    await transactionDb.update({ tenantId, ...toItem })
    await transactionDb.updateMeta(toItem.id, tenantId, meta)
    const attachmentDb = new AttachmentDb()
    /** @type {psbf.Attachment[]} */
    const attachments = await attachmentDb.listByEntity(tenantId, fromItem.id)
    for (const attachment of attachments) {
      attachment.entityId = toItem.id
      await attachmentDb.update(attachment)
      await dataChangeLogic.insert(attachmentDb.tableName, attachment.id, ops.UPDATE, { attachment })
    }
    const attachmwentList = controller.getAttachmentList(attachments)

    await dataChangeLogic.insert(transactionDb.tableName, fromItem.id, ops.DELETE, fromItem)
    await dataChangeLogic.insert(attachmentDb.tableName, toItem.id, ops.UPDATE, { tenantId, ...toItem })
    toItem.amount = toItem.amount / 100
    toItem.meta = meta
    return { transaction: toItem, attachments: attachmwentList, deletedId: fromItem.id }
  },

  /**
   * Merges 2 transactions meta fields.
   * @param {?string} meta1
   * @param {?string} meta2
   * @return {null|Object}
   */
  mergeMetas: (meta1, meta2) => {
    if (!meta1 && !meta2) return null

    const m1 = Boolean(meta1) ? JSON.parse(meta1) : null
    const m2 = Boolean(meta2) ? JSON.parse(meta2) : null

    if (m1 && !m2) return m1
    if (!m1 && m2) return m2

    return Object.assign(m1, m2)
  },

  deleteAttachment: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    const attachmentId = req.params.attachmentId
    logger.info('deleteAttachment', { id, tenantId, userId, attachmentId })

    await controller.removeAttachment(id, tenantId, userId, attachmentId)

    res.json({})
  },

  /**
   * Deletes entity (transaction or other) attachment.
   * @param {string} id transaction id
   * @param {string} tenantId
   * @param userId
   * @param attachmentId
   * @return {Promise<void>}
   */
  removeAttachment: async (id, tenantId, userId, attachmentId) => {
    const attachmentDb = new AttachmentDb()
    const attachments = await attachmentDb.get(attachmentId, tenantId)
    if (attachments.length === 0) return res.status(404).json({ error: 'Cannot find attachment' })

    await attachmentDb.delete({ id: attachmentId, tenantId })
    try {
      await controller.moveFile(attachments[0].fileName)
    } catch (e) {
      logger.error('removeAttachment', {id, tenantId, userId, attachmentId, e})
    }
    const transactionAttachments = await attachmentDb.listByEntity(tenantId, id)
    if (transactionAttachments.length === 0) await controller.updateHasAttachment(id, tenantId, false)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(attachmentDb.tableName, attachmentId, ops.DELETE, attachments[0])
  },


  async moveFile (fileName) {
    await fs.promises.mkdir(path.resolve('../files', 'deleted'), { recursive: true })
    const oldPath = path.resolve('../files', fileName)
    const newPath = path.resolve('../files', 'deleted', fileName)
    await fs.promises.rename(oldPath, newPath)
  },

  /**
   * Returns list of years for which tenant has transactions and the next year.
   * @param {string} teantnId
   * @return {Promise<number[]>}
   */
  getYears: async teantnId => {
    const transactionDb = new TransactionDb()
    const minDate = await transactionDb.getMinimumDate(teantnId)
    let result = []
    const thisYear = (new Date()).getFullYear()
    const nextYear = thisYear + 1
    if (minDate.length === 0) {
      result = [thisYear, nextYear]
    } else {
      const minYear = minDate[0].minDate.getFullYear()
      for (let i = 0; i <= nextYear - minYear; i++) {
        result[i] = minYear + i
      }
    }
    result = result.sort((a, b) => (a >= b ? -1 : 1))

    return result
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/').get(asyncHandler(controller.list))
router.route('/:id/transactions').get(asyncHandler(controller.listChildren))
router.route('/:id/attachments').get(asyncHandler(controller.listAttachments))
router.route('/:id/attachments').post(asyncHandler(controller.insertAttachment))
router.route('/:id/attachments/:attachmentId').delete(asyncHandler(controller.deleteAttachment))
router.route('/:id/merge').patch(asyncHandler(controller.updateMerge))
router.route('/:id').patch(asyncHandler(controller.update))
router.route('/:id').delete(asyncHandler(controller.delete))
router.route('/').post(asyncHandler(controller.insert))
export default router

export {
  controller
}

/**
 * @typedef {Object} AttachmentFileInfo
 * @property {string} id
 * @property {string} originalName
 * @property {number} size
 * @property {string} internalName
 * @property {string} filePath
 * @property {string} archiveFilePath
 */

/**
 * @typedef {Object} TransactionDataError
 * @property {string} [postedDate]
 * @property {string} [description]
 * @property {string} [amount]
 * @property {string} [note]
 * @property {string} [categoryId]
 * @property {string} [businessId]
 */
