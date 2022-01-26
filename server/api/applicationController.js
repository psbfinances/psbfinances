'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'

import { AccountDb, BudgetDb, BusinessDb, CarDb, CategoryDb, TransactionDb } from '../db/index.js'
import { accounts, budget, businesses, cars, categories, transactions } from './demoData.js'
import utils from './utils.js'
import DataChangeLogic, { ops } from './dataChangeLogic.js'
import { getLogger } from '../core/index.js'
import { controller as categoryController } from './categoryController.js'
import { controller as transactionController } from './transactionController.js'

const logger = getLogger(import.meta.url)

const controller = {
  /**
   * Gets application settings for a tenant.
   * @link module:psbf/api/application
   * @property {AppRequest} req
   * @property {import('express').Response} res
   * @return {Promise<GetResponse>}
   */
  get: async (req, res) => {
    const { tenantId, userId } = utils.getBasicRequestData(req)
    logger.debug('get', { tenantId, userId })
    res.json(await controller.getApplicationSettings(tenantId))
  },

  /**
   * Gets application settings for a tenant.
   * @param {string} tenantId
   * @return {Promise<{years: number[]}>}
   */
  getApplicationSettings: async tenantId => {
    const years = await transactionController.getYears(tenantId)

    return { years }
  },

  /**
   * Adds demo data
   * @property {AppRequest} req
   * @property {import('express').Response} res
   * @return {void}
   */
  postDemoData: async (req, res) => {
    const { tenantId, userId } = utils.getBasicRequestData(req)
    logger.debug('postDemoData', { tenantId, userId })

    await controller.insertDemoData(tenantId, userId)

    res.json({})
  },

  /**
   * Inserts demo dat into a specific table.
   * @param {string} tenantId
   * @param {Class} table
   * @param {Object[]} items
   * @return {Promise<void>}
   */
  insertDataIntoDemoTable: async (tenantId, table, items) => {
    logger.info('insertDataIntoDemoTable', { tenantId, table: table.name, itemCount: items.length })
    try {
      const db = new table()
      for (const item of items) {
        item.tenantId = tenantId
        await db.insert(item)
      }
    } catch (e) {
      logger.error('insertDataIntoDemoTable', { tenantId, table: table.name, e })
    }
  },

  /**
   * Inserts demo data
   * @param {string} tenantId
   * @param {string} userId
   * @return {Promise<void>}
   */
  insertDemoData: async (tenantId, userId) => {
    await controller.insertDataIntoDemoTable(tenantId, AccountDb, accounts)
    await controller.insertDataIntoDemoTable(tenantId, BudgetDb, budget)
    await controller.insertDataIntoDemoTable(tenantId, BusinessDb, businesses)
    await controller.insertDataIntoDemoTable(tenantId, CarDb, cars)
    await controller.insertDataIntoDemoTable(tenantId, CategoryDb, categories)
    await controller.insertDataIntoDemoTable(tenantId, TransactionDb, transactions)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert('transactions', 'demo-data', ops.INSERT, {})
    return Promise.resolve()
  },

  /**
   * Deletes demo data
   * @property {AppRequest} req
   * @property {import('express').Response} res
   * @return {void}
   */
  deleteDemoData: async (req, res) => {
    const { tenantId, userId } = utils.getBasicRequestData(req)
    logger.debug('deleteDemoData', { tenantId, userId })

    await controller.removeDemoData(tenantId, userId)

    res.json({})
  },

  /**
   * Deletes tenant data from a specif table.
   * @param {string} tenantId
   * @param {Class} table
   * @return {Promise<void>}
   */
  deleteTenantData: async (tenantId, table) => {
    logger.info('deleteTenantData', { tenantId, table: table.name })
    try {
      const db = new table()
      await db.delete({ tenantId })
    } catch (e) {
      logger.error('deleteTenantData', { tenantId, table: table.name, e })
    }
  },

  /**
   * Deletes demo data
   * @param {string} tenantId
   * @param {string} userId
   * @return {Promise<void>}
   */
  removeDemoData: async (tenantId, userId) => {
    await controller.deleteTenantData(tenantId, TransactionDb)
    await controller.deleteTenantData(tenantId, BudgetDb)
    await controller.deleteTenantData(tenantId, CarDb)
    await controller.deleteTenantData(tenantId, BusinessDb)
    await controller.deleteTenantData(tenantId, AccountDb)
    await controller.deleteTenantData(tenantId, CategoryDb)

    await categoryController.insertDefaults(tenantId, userId)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert('transactions', 'demo-data', ops.DELETE, {})
    return Promise.resolve()
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/').get(asyncHandler(controller.get))
router.route('/demo-data').post(asyncHandler(controller.postDemoData))
router.route('/demo-data').delete(asyncHandler(controller.deleteDemoData))

export default router
export { controller }
