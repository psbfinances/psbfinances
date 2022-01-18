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
   * @property {string} req.query.accountId
   * @property {string} req.query.dateFrom
   * @property {string} req.query.dateTo
   * @return {Array<Transaction>}
   */
  get: async (req, res) => {
    const tenantId = req.user.tenantId
    const dashboardDb = new DashboardDb()
    const period = req.query && req.query.period ? req.query.period : null
    const year = req.query && req.query.year ? req.query.year : null
    const businessId = req.query && req.query.businessId ? req.query.businessId : null

    let accounts = []
    let transactions = []
    let businessPL = []
    let businessPLCurrentMonth = []
    let businessPLCurrentYear = []
    let budget = []
    let budgetYear = []
    let tasks = []
    const pl = new Map()

    if (businessId === c.PERSONAL_TYPE_ID) {
      accounts = await dashboardDb.listBalances(tenantId)
      transactions = await dashboardDb.listTransactions(tenantId)
      budget = await controller.getBudget(tenantId, period, year, true)
      budgetYear = await controller.getBudget(tenantId, period, year, false)
      tasks = await dashboardDb.listTransactionsWithTasks(tenantId)
    } else {
      businessPL = await dashboardDb.listBusinessPL(tenantId, businessId, year)
      businessPLCurrentMonth = await dashboardDb.listBusinessPLCurrentMonth(tenantId, businessId, period, year)
      businessPLCurrentYear = await dashboardDb.listBusinessPLCurrentYear(tenantId, businessId, year)
      businessPL.forEach(x => {
        const hasMonthData = pl.has(x.month)
        const monthData = hasMonthData ? pl.get(x.month) : { income: 0, expenses: 0, profit: 0 }
        if (x.type === 'e') monthData.expenses = monthData.expenses + x.total
        if (x.type === 'i') monthData.income = monthData.income + x.total
        monthData.profit = monthData.income + monthData.expenses
        pl.set(x.month, monthData)
      })
    }

    res.json({
      accounts,
      transactions,
      tasks,
      pl: Object.fromEntries(pl),
      businessPLCurrentMonth,
      businessPLCurrentYear,
      budget,
      budgetYear
    })
  },

  /**
   *
   * @param {string} tenantId
   * @param {'cm'|'lm'} period
   * @param {string} selectedYear
   * @param {boolean} monthOnly = true - show data for the month or the whole year
   * @return {Promise<*>}
   */
  getBudget: async (tenantId, period, selectedYear, monthOnly = true) => {
    logger.debug('getBudget', {tenantId, period, selectedYear, monthOnly})
    const year = Number.parseInt(selectedYear)
    const month = period
    const categoryDb = new CategoryDb()
    const dashboardDb = new DashboardDb()
    const budgetDb = new BudgetDb()

    const categories = await categoryDb.list(tenantId)
    const expenses = await dashboardDb.listBudgetCurrentMonth(tenantId, year, month, monthOnly)
    const budgets = await budgetDb.listByYearAndMonth(tenantId, year, month, monthOnly)

    logger.debug('getBudget', {c: categories.length, e: expenses.length, b: budgets.length})

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
