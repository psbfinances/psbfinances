'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'

import { AccountDb, TransactionDb } from '../db/index.js'
import utils from './utils.js'
import DataChangeLogic, { ops } from './dataChangeLogic.js'
import { accountModel } from '../../shared/models/index.js'
import cuid from 'cuid'
import { getLogger } from '../core/index.js'

const logger = getLogger(import.meta.url)

const controller = {
  /**
   * Gets tenant accounts
   * @property {AppRequest} req
   * @property {Response} response
   * @return {Array<FinancialAccount>}
   */
  list: async (req, res) => {
    const db = new AccountDb()
    const rows = await db.listWithExtras(req.user.tenantId, true, true)

    rows.forEach(x => {
      if (x.meta) x.meta = JSON.parse(x.meta)
      x.openingBalance = x.openingBalance ? x.openingBalance / 100 : 0
      if (x.currentBalance !== undefined) x.currentBalance = x.currentBalance ? x.currentBalance / 100 : 0
      delete x.tenantId
      delete x.balance
    })
    res.json(rows)
  },

  get: async (req, res) => {
    logger.debug('get', { regQuery: req.query })
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    const include = req.query.include ? req.query.include.split(',').map(item => item.trim()) : []
    const includeBalance = include.includes('balance')
    const includeUnreconciled = include.includes('unreconciled')

    let result
    if (includeBalance || includeUnreconciled) {
      const db = new AccountDb()
      const rows = await db.getWithExtras(id, tenantId, includeBalance, includeUnreconciled)
      result = rows[0]
      if (result) {
        if (result.meta) result.meta = JSON.parse(result.meta)
        result.openingBalance = result.openingBalance ? result.openingBalance / 100 : 0
        if (result.currentBalance !== undefined && result.currentBalance !== null) {
          result.currentBalance = Math.round(result.currentBalance / 100)
        }
        delete result.tenantId
        delete result.balance
      }
    } else {
      result = await controller.processGet(tenantId, userId, id, req.query)
    }

    res.json(result)
  },

  /**
   * Handles GET request.
   * @param {string} tenantId
   * @param {string} userId
   * @param {string} id
   * @param {Object} query
   * @param {string} [query.currentBalance]
   * @return {Promise<FinancialAccount>}
   */
  processGet: async (tenantId, userId, id, query) => {
    const db = new AccountDb()
    const accounts = await db.get(id, tenantId)
    const account = accounts[0]
    const currentBalance = query.currentBalance
    if (currentBalance !== undefined) {
      const transactionDb = new TransactionDb()
      const totals = await transactionDb.getTotalAmountByAccount(id, tenantId)
      account.openingBalance = Math.round(currentBalance * 100 - totals[0].total) / 100
    }
    return account
  },

  /**
   * Saves a new account.
   * @property {AppRequest} req
   * @property {FinancialAccount} req.body
   * @property {import('express').Response} res
   * @return {FinancialAccount|Object}
   */
  insert: async (req, res) => {
    logger.debug('insert', { body: req.body })
    const { tenantId, userId, id } = utils.getBasicRequestData(req)

    const account = req.body
    const errors = accountModel.validate(account)
    if (Object.keys(errors).length > 0) return res.json({ errors })

    account.id = cuid()
    account.tenantId = tenantId
    account.openingBalance = (account.openingBalance || 0) * 100
    account.createdAt = new Date()
    const accountDb = new AccountDb()
    await accountDb.insert(account)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(accountDb.tableName, id, ops.INSERT, account)
    res.json(account)
  },

  /**
   * Updates existing accounts.
   * @property {AppRequest} req
   * @property {FinancialAccount} req.body
   * @property {Response} response
   * @return {FinancialAccount|Object}
   */
  update: async (req, res) => {
    logger.debug('update', { body: req.body })
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    /** @type {FinancialAccount} */
    const { createdAt, ...account } = { ...req.body }
    const errors = accountModel.validate(account)
    if (Object.keys(errors).length > 0) return res.json({ errors })

    const accountDb = new AccountDb()
    const dataChangeLogic = new DataChangeLogic(tenantId, userId)

    if (account.isDefault) {
      const currentDefaultAccount = await accountDb.getDefault(tenantId)
      if (currentDefaultAccount.length > 0 && currentDefaultAccount[0].id !== account.id) {
        await accountDb.update({ id: currentDefaultAccount[0].id, tenantId, isDefault: 0 })
        await dataChangeLogic.insert(accountDb.tableName, currentDefaultAccount[0].id, ops.UPDATE, { isDefault: 0 })
      }
    }
    account.openingBalance = (account.openingBalance || 0) * 100
    await accountDb.update({ id, tenantId, ...account })

    await dataChangeLogic.insert(accountDb.tableName, id, ops.UPDATE, account)

    res.json(account)
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/:id').get(asyncHandler(controller.get))
router.route('/').get(asyncHandler(controller.list))
router.route('/').post(asyncHandler(controller.insert))
router.route('/:id').put(asyncHandler(controller.update))

export default router
export { controller }
