'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'
import { DuplicateCandidateDb, DuplicateTransactionDb, TransactionDb, TripDb } from '../db/index.js'
import { getLogger } from '../core/index.js'
import DataChangeLogic, { ops } from './dataChangeLogic.js'
import utils from './utils.js'

const logger = getLogger(import.meta.url)

const controller = {
  /**
   * Gets duplicates by parent id.
   * @param {AppRequest} req
   * @param {Object} req.params
   * @param {string} req.params.id - parent transaction id
   * @param {import('express').Response} res
   * @return {Promise<void>}
   */
  listByParentId: async (req, res) => {
    const { tenantId, id } = utils.getBasicRequestData(req)
    const result = await controller.processListByParentId(id, tenantId)
    res.json(result)
  },

  /**
   * Handles request to gets duplicates by parent id.
   * @param {string} id
   * @param {string} tenantId
   * @return {Promise<*[][]|*[]>}
   */
  async processListByParentId (id, tenantId) {
    const duplicateTransactionDb = new DuplicateTransactionDb()
    const dbItems = await duplicateTransactionDb.listByParentTransactionId(id, tenantId)
    if (dbItems.length === 0) return []

    return dbItems.map(x => {
      const transactions = JSON.parse(x.transactionData)
      const transaction = transactions[0]
      const { postedDate, description, amount } = transaction
      return { id: x.id, postedDate, description, amount: amount / 100 }
    })
  },

  /**
   *
   * @param {AppRequest} req
   * @param {Object} req.params
   * @param {string} req.params.id
   * @param {import('express').Response} res
   * @return {Promise<void>}
   */
  put: async (req, res) => {
    const { tenantId, id } = utils.getBasicRequestData(req)
    logger.info('put', { tenantId, id })

    const transactionDb = new TransactionDb()
    const duplicateTransactionDb = new DuplicateTransactionDb()
    const duplicateCandidateDb = new DuplicateCandidateDb()

    const transactionData = await transactionDb.get(id, tenantId, '*')
    const { accountId, postedDate, originalDescription, amount, externalUid } = transactionData
    const duplicates = await duplicateCandidateDb.listByTransactionIds([id])
    let parentTransactionId
    let duplicateCandidateId
    if (duplicates.length > 0) {
      parentTransactionId = duplicates[0].duplicateId
      duplicateCandidateId = duplicates[0].duplicateId
    } else {
      const parentTransaction = await transactionDb.getDuplicate(
        { id, accountId, postedDate, originalDescription, amount, tenantId })
      parentTransactionId = parentTransaction.length > 0 ? parentTransaction[0].id : null
    }

    logger.debug('put', { step: 'duplicateTransactionDb.insert', tenantId, id, parentTransactionId, transactionData })
    await duplicateTransactionDb.insert(tenantId, id, parentTransactionId, transactionData, externalUid)
    logger.debug('put', { step: 'transactionDb.delete', id, tenantId })
    await transactionDb.delete({ id, tenantId })
    if (parentTransactionId) {
      await transactionDb.update({ id: parentTransactionId, tenantId, hasDuplicates: true })
    }

    const dataChangeLogic = new DataChangeLogic(tenantId, req.user.id)
    if (transactionData.tripId) {
      const tripDb = new TripDb()
      await tripDb.delete({ id: transactionData.tripId, tenantId })
      await dataChangeLogic.insert(tripDb.tableName, transactionData.tripId, ops.DELETE,
        { transactionId: transactionData.id })
    }

    await dataChangeLogic.insert(transactionDb.tableName, id, ops.DELETE, { parentTransactionId })
    await dataChangeLogic.insert(duplicateTransactionDb.tableName, id, ops.INSERT,
      { parentTransactionId, transactionData })

    if (duplicateCandidateId) {
      await controller.updateResolve(transactionData.id, duplicateCandidateId, req.user.id, tenantId)
    }

    res.json({ parentTransactionId })
  },

  /**
   * Updates resolve for duplicates.
   * @param {string} transactionId
   * @param {string} userId
   * @param {string} tenantId
   * @return {Promise<[string]>}
   */
  updateResolve: async (transactionId, userId, tenantId) => {
    logger.info('updateResolve', { transactionId, userId })
    const duplicateCandidateDb = new DuplicateCandidateDb()

    const duplicateCandidates = await duplicateCandidateDb.listByTransaction(transactionId)
    const unresolvedDuplicateCandidates = duplicateCandidates.filter(x => !x.resolved)
    if (unresolvedDuplicateCandidates.length === 0) return []
    const duplicateCandidateIds = unresolvedDuplicateCandidates.map(x => x.id)
    let transactionIds = unresolvedDuplicateCandidates.map(x => x.transactionId)
    transactionIds = [...new Set(transactionIds)]

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    for (let id of duplicateCandidateIds) {
      await duplicateCandidateDb.update({ id, tenantId: null, resolved: true })
      await dataChangeLogic.insert(duplicateCandidateDb.tableName, id, ops.UPDATE, { resolved: true })
    }

    return transactionIds
  },

  /**
   * Updates resolve field.
   * @param {AppRequest} req
   * @param {import('express').Response} res
   * @return {Promise<{[number]}>}
   */
  resolve: async (req, res) => {
    const { tenantId, id } = utils.getBasicRequestData(req)
    logger.info('resolve', { tenantId, id })

    const transactionDb = new TransactionDb()

    const transaction = await transactionDb.get(id, tenantId)
    if (!transaction) return res.status(405).json({ error: 'Invalid request' })

    const duplicateCandidateIds = await controller.updateResolve(id, req.user.id, tenantId)

    res.json({ duplicateCandidateIds })

  },

  /**
   * Undo mark transaction as duplicate - put it back into the list of transactions.
   * @param {AppRequest} req
   * @param {import('express').Response} res
   * @return {Promise<{[number]}>}
   */
  undo: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    logger.info('undo', { tenantId, userId, id })
    const result = await controller.processUndo(id, tenantId, userId)
    res.json(result)
  },

  /**
   * Handles UnDo mark-as-duplicate logic.
   * @param {number} id
   * @param {string} tenantId
   * @param {string} userId
   * @return {Promise<psbf.Transaction|{}>}
   */
  processUndo: async (id, tenantId, userId) => {
    const duplicateTransactionDb = new DuplicateTransactionDb()
    const transactionDb = new TransactionDb()

    const duplicate = await duplicateTransactionDb.get(id, tenantId)
    if (!duplicate) return {}

    const transaction = JSON.parse(duplicate.transactionData)
    transaction.postedDate = transaction.postedDate.substr(0, 10)
    await transactionDb.insert(transaction)
    await duplicateTransactionDb.delete({ id, tenantId })

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(transactionDb.tableName, transaction.id, ops.INSERT, { transaction })
    await dataChangeLogic.insert(duplicateTransactionDb.tableName, id.toString(), ops.DELETE,
      { ops: 'undo', id, transactionId: transaction.id })

    return transaction
  },

  /**
   * Deletes transaction from duplicate list.
   * @param {AppRequest} req
   * @param {Object} req.params
   * @param {string} req.params.is
   * @param {import('express').Response} res
   */
  delete: async (req, res) => {
    const { tenantId, id } = utils.getBasicRequestData(req)
    logger.info('delete', { tenantId, id })

    const duplicateTransactionDb = new DuplicateTransactionDb()
    const transactionDb = new TransactionDb()

    const duplicate = await duplicateTransactionDb.get(id, tenantId)
    const transaction = JSON.parse(duplicate[0].transactionData)[0]
    // if (transaction.descriptionId) delete transaction.descriptionId
    transaction.postedDate = transaction.postedDate.substr(0, 10)

    await transactionDb.insert(transaction)
    await duplicateTransactionDb.delete({ tenantId, id })

    const dataChangeLogic = new DataChangeLogic(tenantId, req.user.id)
    await dataChangeLogic.insert(duplicateTransactionDb.tableName, id, ops.DELETE, { duplicate: duplicate[0] })
    await dataChangeLogic.insert(transactionDb.tableName, transaction.id, ops.INSERT, { transaction })

    res.json(transaction)
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/:id').get(asyncHandler(controller.listByParentId))
router.route('/:id').put(asyncHandler(controller.put))
router.route('/:id/resolve').patch(asyncHandler(controller.resolve))
router.route('/:id/undo').patch(asyncHandler(controller.undo))
router.route('/:id').delete(asyncHandler(controller.delete))
export default router

export {
  controller
}
