'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'
import { DashboardDb, CategoryDb, BusinessDb } from '../db/index.js'
import { c } from '@psbfinances/shared/core/index.js'
import getLogger from '../core/logger.js'
import { controller as tripController } from './tripController.js'
import utils from './utils.js'
import validator from 'validator'

const logger = getLogger(import.meta.url)

const controller = {
  /** @link module:psbf/api/reports */
  /**
   * Gets tenant transactions by account and date range.
   * @property {AppRequest} req
   * @property {YearTaxRequest} req.query
   * @property {import(express).Response} res
   */
  getYearTaxes: async (req, res) => {
    const { tenantId, userId } = utils.getBasicRequestData(req)
    const criteria = req.query
    logger.info('list', { tenantId, userId, ...criteria })
    const result = await controller.calculateYearTaxes(tenantId, criteria.businessId, criteria.year)
    res.json(result)
  },

  /**
   * Maps PL items to categories.
   * @param {psbf.Category[]} categories
   * @param {string} categoryType
   * @param {PLItem[]} pl
   * @return {*}
   */
  mapAmountsToCategories: (categories, categoryType, pl) => {
    const typeCategories = categories.filter(x => x.type === categoryType && !x.isPersonal).
      sort((x, y) => x.name >= y.name ? 1 : 0)
    return typeCategories.map(x => {
      const plItem = pl.find(y => y.categoryId === x.id)
      return {
        categoryId: x.id,
        categoryName: x.name,
        amount: Math.abs(plItem ? plItem.amount / 100 : 0)
      }
    })

  },

  /**
   * Calculates business year taxes (Schedule C).
   * @param {string} tenantId
   * @param {string} businessId
   * @param {string} year
   * @return {Promise<YearTaxResponse>}
   */
  calculateYearTaxes: async (tenantId, businessId, year) => {
    logger.info('calculateYearTaxes', { tenantId, businessId, year })
    const isEmpty = validator.isEmpty
    if (isEmpty(businessId) || isEmpty(tenantId) || isEmpty(year)) throw new Error('Invalid report criteria')
    const businessDb = new BusinessDb()
    const business = await businessDb.get(businessId, tenantId)
    if (business.length === 0) throw new Error('Invalid business')

    const dashboardDb = new DashboardDb()
    const categoriesDb = new CategoryDb()
    const pl = await dashboardDb.listBusinessPLCurrentYear(tenantId, businessId, year)

    const categories = await categoriesDb.list(tenantId)
    const businessCategories = categories.filter(x => !x.isPersonal).sort((x, y) => x.name >= y.name ? 1 : 0)
    const income = controller.mapAmountsToCategories(businessCategories, c.transactionType.INCOME, pl)
    const expenses = controller.mapAmountsToCategories(businessCategories, c.transactionType.EXPENSE, pl)

    const totalIncome = income.reduce((t, x) => t += x.amount, 0)
    const totalExpenses = expenses.reduce((t, x) => t += x.amount, 0)
    const profit = totalIncome - totalExpenses

    const mileage = await tripController.calcTotalByBusinessAndDates(tenantId, businessId, year)

    return { year, businessId, income, expenses, totalIncome, totalExpenses, profit, mileage }
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/year-tax').get(asyncHandler(controller.getYearTaxes))
export default router

export {
  controller
}
