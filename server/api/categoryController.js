'use strict'

import express from 'express'
import cuid from 'cuid'
import asyncHandler from 'express-async-handler'
import { BusinessDb, CategoryDb } from '../db/index.js'
import utils from './utils.js'
import { categoryModel } from '../../shared/models/index.js'
import DataChangeLogic, { ops } from './dataChangeLogic.js'
import { c } from '../../shared/core/index.js'

const controller = {
  /**
   * Gets tenant categories.
   * @property {AppRequest} req
   * @property {e.Response} response
   * @return {Array<psbf.Category>}
   */
  list: async (req, res) => {
    const { tenantId } = utils.getBasicRequestData(req)
    const db = new CategoryDb()
    /** @type {psbf.Category[]} */
    let rows = await db.list(tenantId)

    const businessDb = new BusinessDb()
    const businesses = await businessDb.list(tenantId)
    if (businesses.length === 0) rows = rows.filter(x => x.isPersonal)
    rows.forEach(x => (delete x.tenantId))
    res.json(rows)
  },

  /**
   * Saves a new category.
   * @property {AppRequest} req
   * @property {psbf.Category} req.body
   * @property {Response} response
   * @return {psbf.Category|Object}
   */
  insert: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)

    const category = req.body
    const errors = categoryModel.validate(category)
    if (Object.keys(errors).length > 0) return res.json({ errors })

    category.id = cuid()
    category.tenantId = tenantId
    const categoryDb = new CategoryDb()
    await categoryDb.insert(category)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(categoryDb.tableName, id, ops.INSERT, category)
    res.json(category)
  },

  insertDefaults: async (tenantId, userId) => {
    const categoryDb = new CategoryDb()
    for (let category of defaultCategories) {
      category.id = cuid()
      category.tenantId = tenantId
      await categoryDb.insert(category)
    }
    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(categoryDb.tableName, 'defaultCategories', ops.INSERT, [])
  },

  /**
   * Updates existing category.
   * @property {AppRequest} req
   * @property {psbf.Category} req.body
   * @property {Response} response
   * @return {psbf.Category|Object}
   */
  update: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    /** @type {psbf.Category} */
    const category = req.body
    const errors = categoryModel.validate(category)
    if (Object.keys(errors).length > 0) return res.json({ errors })

    const categoryDb = new CategoryDb()
    await categoryDb.update({ id, tenantId, ...category })

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(categoryDb.tableName, id, ops.UPDATE, category)

    res.json(category)
  }
}

const defaultCategories = [
  { name: 'Auto Insurance', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Auto payment', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Entertainment', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Federal Tax', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Food', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Shopping', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Mortgage & Rent', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'CC payment', isPersonal: true, type: c.transactionType.TRANSFER },
  { name: 'Personal Care', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Phone', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Gas & Fuel', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Home', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Vacation', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Interest Income', isPersonal: true, type: c.transactionType.INCOME },
  { name: 'Pets', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Life Insurance', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Gifts', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Health', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Pet Insurance', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Misc Expenses', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Unemployment Income', isPersonal: true, type: c.transactionType.INCOME },
  { name: 'Property Tax', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Utilities', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Income', isPersonal: true, type: c.transactionType.INCOME },
  { name: 'Transfer', isPersonal: true, type: c.transactionType.TRANSFER },
  { name: 'Paycheck', isPersonal: true, type: c.transactionType.INCOME },
  { name: 'Car', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Charity', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Home Insurance', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Bank Fee', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Loan', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'State Tax', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Check', isPersonal: true, type: c.transactionType.EXPENSE },
  { name: 'Advertising', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Business Travel', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Commissions', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Communication', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Contract Labor', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Insurance Payment', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Interest Payment', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Legal and Professional Fees', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Meals', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Office Expenses', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Rental Expenses', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Repair and Maintenance', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Supplies', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Taxes and Licences', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Utilities', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Other Misc Expenses', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Business Income', isPersonal: false, type: c.transactionType.INCOME },
  { name: 'Car - parking & tolls', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Moving', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Loan', isPersonal: false, type: c.transactionType.INCOME },
  { name: 'Federal Tax - Estimates', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Federal Tax', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Health Insurance', isPersonal: false, type: c.transactionType.EXPENSE },
  { name: 'Interest Income', isPersonal: false, type: c.transactionType.EXPENSE }
]

/** @type {import('express').Router} */
const router = express.Router()
router.route('/').get(asyncHandler(controller.list))
router.route('/').post(asyncHandler(controller.insert))
router.route('/:id').put(asyncHandler(controller.update))

export default router

export {
  controller
}
