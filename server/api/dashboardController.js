'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'
import { DashboardDb, CategoryDb, BudgetDb } from '../db/index.js'
import { c } from '@psbfinances/shared/core/index.js'
import getLogger from '../core/logger.js'

const logger = getLogger(import.meta.url)

const controller = {
  /**
   * Gets tenant transactions by account and date range.
   * @property {AppRequest} req
   * @property {Object} req.query
   * @property {string} req.query.period month
   * @property {string} req.query.year
   * @property {string} req.query.businessId
   * @property {boolean} req.query.reconciledOnly
   * @return {Array<Transaction>}
   */
  get: async (req, res) => {
    const tenantId = req.user.tenantId
    const dashboardDb = new DashboardDb()
    const period = req.query.period ? req.query.period : null
    const year = req.query.year ? req.query.year : null
    const businessId = req.query.businessId ? req.query.businessId : null
    const reconciledOnly = req.query.reconciledOnly !== 'false'
    logger.info('get', { tenantId, year, period, businessId, reconciledOnly })

    if (businessId === c.PERSONAL_TYPE_ID) {
      const [accounts, transactions, reportExcludedTransactions, budget, budgetYear, tasks] = await Promise.all([
        dashboardDb.listBalances(tenantId),
        dashboardDb.listTransactions(tenantId),
        dashboardDb.listReportExcludedTransactions(tenantId, year),
        controller.getBudget(tenantId, period, year, true, reconciledOnly),
        controller.getBudget(tenantId, period, year, false, reconciledOnly),
        dashboardDb.listTransactionsWithTasks(tenantId)
      ])
      res.json({ accounts, transactions, reportExcludedTransactions, tasks, budget, budgetYear })
    } else {
      const [businessPL, businessPLCurrentMonth, businessPLCurrentYear] = await Promise.all([
        dashboardDb.listBusinessPL(tenantId, businessId, year, reconciledOnly),
        dashboardDb.listBusinessPLCurrentMonth(tenantId, businessId, period, year, reconciledOnly),
        dashboardDb.listBusinessPLCurrentYear(tenantId, businessId, year, reconciledOnly)
      ])
      let prevYearEntry = businessPL.length > 0 ? businessPL[0].year : 0
      const pl = new Map()
      businessPL.forEach(x => {
        const key = `${x.year}-${x.month}`
        const hasMonthData = pl.has(key)
        const monthData = hasMonthData ? pl.get(key) : { income: 0, expenses: 0, profit: 0 }
        monthData.newYear = monthData.newYear === undefined ? prevYearEntry !== x.year : monthData.newYear
        prevYearEntry = x.year
        if (x.type === 'e') monthData.expenses = monthData.expenses + x.total
        if (x.type === 'i') monthData.income = monthData.income + x.total
        monthData.profit = monthData.income + monthData.expenses
        pl.set(key, monthData)
        // pl.set(`${x.month}`, monthData)
      })
      res.json({
        pl: Object.fromEntries(pl),
        businessPLCurrentMonth,
        businessPLCurrentYear,
      })
    }
  },

  /**
   *
   * @param {string} tenantId
   * @param {'cm'|'lm'} period
   * @param {string} selectedYear
   * @param {boolean} monthOnly = true - show data for the month or the whole year
   * @param {boolean} reconciledOnly
   * @return {Promise<*>}
   */
  getBudget: async (tenantId, period, selectedYear, monthOnly = true, reconciledOnly) => {
    logger.debug('getBudget', { tenantId, period, selectedYear, monthOnly })
    const year = Number.parseInt(selectedYear)
    const currentYear = (new Date()).getFullYear()
    const month = year === currentYear || monthOnly ? period : 12
    const categoryDb = new CategoryDb()
    const dashboardDb = new DashboardDb()
    const budgetDb = new BudgetDb()

    const categories = await categoryDb.list(tenantId)
    const expenses = await dashboardDb.listBudgetCurrentMonth(tenantId, year, month, monthOnly, reconciledOnly)
    const budgets = await budgetDb.listByYearAndMonth(tenantId, year, month, monthOnly)

    logger.debug('getBudget', { c: categories.length, e: expenses.length, b: budgets.length })

    return categories.filter(x => Boolean(x.isPersonal) && x.type === 'e').map(x => {
      const expense = expenses.find(e => e.categoryId === x.id)
      const budget = budgets.filter(b => b.categoryId === x.id).reduce((t, x) => t + x.amount, 0)
      const expenseAmount = expense ? -1 * expense.amount : 0
      const budgetAmount = budget
      const delta = budgetAmount - expenseAmount
      return {
        categoryId: x.id,
        name: x.name,
        amount: expenseAmount,
        budget: budgetAmount,
        delta,
        comment: budget ? budget.comment : ''
      }
    }).filter(y => y.amount !== 0 || y.budget !== 0).sort((first, second) => {
      return first.budget > second.budget ? -1 : 1
    })
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/').get(asyncHandler(controller.get))
export default router
