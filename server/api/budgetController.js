'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'
import { BudgetDb, CategoryDb } from '../db/index.js'
import utils from './utils.js'
import DataChangeLogic, { ops } from './dataChangeLogic.js'
import { getLogger } from '../core/index.js'

const logger = getLogger(import.meta.url)

const controller = {
  /**
   * Gets budget.
   * @param {AppRequest} req
   * @param {e.Response} res
   * @return {Array<Business>}
   */
  getList: async (req, res) => {
    const { tenantId, userId } = utils.getBasicRequestData(req)
    const { year } = req.query
    logger.info('list', { tenantId, year, userId })
    const result = await controller.list(tenantId, userId, year)
    res.json(result)
  },

  list: async (tenantId, userId, year) => {
    const budgetDb = new BudgetDb()
    const categoryDb = new CategoryDb()

    const budgetData = await budgetDb.listByCriteria({ tenantId, year })
    let categoryData = await categoryDb.list(tenantId)
    categoryData = categoryData.filter(x => x.isPersonal && x.type === 'e').sort((x, y) => {
      return x.name > y.name ? 1 : -1
    })

    const monthTotals = {
      amounts: new Array(13).fill(0)
    }
    const categoryMonthAmounts = categoryData.map(c => {
      const categoryBudget = budgetData.filter(b => b.categoryId === c.id)
      let row = { categoryId: c.id, categoryName: c.name, amounts: [] }
      row.amounts.push({ month: 0, amount: 0, note: null })
      for (let month = 1; month <= 12; month++) {
        const monthData = categoryBudget.find(cb => cb.monthNo === month)
        const id = monthData ? monthData.id : null
        const categoryMonthAmount = monthData && monthData.amount >= 0 ? Math.round(monthData.amount / 100) : 0
        row.amounts.push({ id, month, amount: categoryMonthAmount, note: monthData ? monthData.comment : null })
        row.amounts[0].amount += categoryMonthAmount
        monthTotals.amounts[month] += categoryMonthAmount
        monthTotals.amounts[0] += categoryMonthAmount
      }
      return row
    })

    return { categoryMonthAmounts, monthTotals, hasBudget: budgetData.length > 0 }
  },

  /**
   * Updates existing budget category.
   * @param {AppRequest} req
   * @param {{year: Number}|Array<psbf.Budget>|psbf.Budget} req.body
   * @param {e.Response} res
   */
  postUpsert: async (req, res) => {
    const { tenantId, userId } = utils.getBasicRequestData(req)
    logger.debug('upsert', { body: req.body, tenantId, userId })
    const result = await controller.upsert(tenantId, userId, req.body)
    res.json(result)
  },

  /**
   * Updates budget.
   * {@ling module:psbf/api/budget}
   * @param tenantId
   * @param userId
   * @param {{year: Number}|Array<psbf.Budget>|psbf.Budget} data
   * @return {ListResponse}
   */
  upsert: async (tenantId, userId, data) => {
    const budgetDb = new BudgetDb()
    const dataChangeLogic = new DataChangeLogic(tenantId, userId)

    let result = []
    if (data.year) {
      await budgetDb.clone(tenantId, data.year)
      await dataChangeLogic.insert(budgetDb.tableName, data.year.toString(), ops.INSERT, { year: data.year })
    } else {
      if (!Array.isArray(data) || data.length === 0) return []

      for (const item of data) {
        item.amount *= 100
        if (item.id) {
          await budgetDb.update({ ...item, tenantId })
        } else {
          delete item.id
          await budgetDb.insert({ tenantId, ...item })
        }
      }
      await dataChangeLogic.insert(budgetDb.tableName, item.year.toString(), ops.INSERT, data)
    }
    return result
  }

}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/').get(asyncHandler(controller.getList))
router.route('/').post(asyncHandler(controller.postUpsert))

export default router
export {
  controller
}
