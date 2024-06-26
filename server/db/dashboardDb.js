'use strict'
/** @link module:psbf/shared/dashboard */

import Db from './db.js'

const getReconciledClause = reconciledOnly => reconciledOnly ? 'reconciled = 1 AND ' : ' '

export default class DashboardDb extends Db {

  constructor () {
    super('transactions')
  }

  async listBalances (tenantId) {
    return this.raw(`SELECT type, accountId, shortName, openingBalance, SUM(amount) total FROM transactions
      INNER JOIN accounts a on transactions.accountId = a.id
      WHERE transactions.tenantId = ? AND
        a.visible = 1 AND
        accountId <> 'ckl2ft0kt000101mr6ncggktq' AND
        source = 'i' AND
        parentId IS NULL
      GROUP BY type, accountId, shortName, openingBalance;`,
      [tenantId])
  }

  async listTransactionsWithTasks (tenantId) {
    return this.raw(`SELECT transactions.id, postedDate, accountId, shortName, description, transactions.note FROM transactions
      INNER JOIN accounts a on transactions.accountId = a.id
      WHERE transactions.tenantId = ? AND
        a.visible = 1 AND
        accountId <> 'ckl2ft0kt000101mr6ncggktq' AND
        transactions.note LIKE '%#task%'
      ORDER BY postedDate DESC;`,
      [tenantId])
  }

  async listTransactions (tenantId) {
    const dateTo = new Date()
    let dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - 10)
    return this.raw(`SELECT postedDate, accountId, shortName, categoryId, name, description, amount, reconciled FROM transactions
      INNER JOIN accounts a on transactions.accountId = a.id
      INNER JOIN categories c on transactions.categoryId = c.id
      WHERE transactions.tenantId = ? AND
        a.visible = 1 AND
        source = 'i' AND
        postedDate >= ? AND postedDate <= ?  AND
        accountId <> 'ckl2ft0kt000101mr6ncggktq' AND
        parentId IS NULL
      ORDER BY postedDate DESC, accountId;`,
      [tenantId, dateFrom, dateTo])
  }

  async listReportExcludedTransactions (tenantId, year) {
    return this.raw(`SELECT postedDate, accountId, shortName, categoryId, name, description, amount, transactions.note
      FROM transactions
      INNER JOIN accounts a on transactions.accountId = a.id
      INNER JOIN categories c on transactions.categoryId = c.id
      WHERE transactions.tenantId = ? AND
        a.visible = 1 AND
        source = 'i' AND
        YEAR(postedDate) = ? AND
        accountId <> 'ckl2ft0kt000101mr6ncggktq' AND
        transactions.note LIKE '%#rep-exclude%'
      ORDER BY postedDate DESC, accountId;`,
      [tenantId, year])
  }

  async listBudgetCurrentMonth (tenantId, year, month, monthOnly, reconciledOnly) {
    return this.raw(`SELECT categoryId, name, SUM(amount) amount
        FROM transactions
                 INNER JOIN accounts a on transactions.accountId = a.id
                 INNER JOIN categories c on transactions.categoryId = c.id
        WHERE transactions.tenantId = ? AND
         a.visible = 1 AND
         isPersonal = 1 AND
         transactions.note NOT LIKE '%#rep-exclude%' AND
         YEAR(postedDate) = ? AND
         MONTH(postedDate) ${monthOnly ? '=' : '<='} ? AND
         ${getReconciledClause(reconciledOnly)}
         hasChildren = 0
        GROUP BY categoryId, name
        ORDER BY amount`,
      [tenantId, year, month])
  }

  /**
   * Returns busines P&L statement.
   * @param {string} tenantId
   * @param {string} businessId
   * @param {string} year
   * @param {boolean} reconciledOnly
   * @return {Promise<BusinessPL[]>}
   */
  async listBusinessPL (tenantId, businessId, year, reconciledOnly) {
    const selectedYear = Number.parseInt(year)
    const currentYear = (new Date()).getFullYear()
    let dateFrom, dateTo
    if (selectedYear === currentYear) {
      const today = new Date()
      const milisecondsInDay = 86400000
      dateFrom = (new Date(today - 400 * milisecondsInDay)).toISOString().substring(0, 10)
      dateTo = (new Date()).toISOString().substring(0, 10)
    } else {
      dateFrom = `${selectedYear}-01-01`
      dateTo = `${selectedYear + 1}-01-01`
    }
    return this.raw(`SELECT YEAR(postedDate) year, MONTH(postedDate) month, type, categoryId, name, SUM(amount) total FROM transactions
        INNER JOIN categories c on transactions.categoryId = c.id
        WHERE
              transactions.tenantId = ? AND
              transactions.businessId = ? AND
              ${getReconciledClause(reconciledOnly)}
              postedDate >= ? AND postedDate <= ? AND
              transactions.note NOT LIKE '%#rep-exclude%' AND
              hasChildren = 0
        GROUP BY YEAR(postedDate), MONTH(postedDate), type ASC, categoryId, name
        ORDER BY year, month, total`,
      [tenantId, businessId, dateFrom, dateTo])
  }

  async listBusinessPLCurrentMonth (tenantId, businessId, period, year, reconciledOnly) {
    return this.raw(`SELECT c.type categoryType, categoryId, name, SUM(amount) amount
        FROM transactions
                 INNER JOIN accounts a on transactions.accountId = a.id
                 INNER JOIN categories c on transactions.categoryId = c.id
        WHERE transactions.tenantId = ? AND
          a.visible = 1 AND
          c.isPersonal = 0 AND
          ${getReconciledClause(reconciledOnly)}
          transactions.businessId = ? AND
          transactions.note NOT LIKE '%#rep-exclude%' AND
         YEAR(postedDate) = ? AND
         MONTH(postedDate) = ?
        GROUP BY categoryType, categoryId, name
        ORDER BY categoryType DESC, amount;`,
      [tenantId, businessId, year, period])
  }

  /**
   * Returns PL by categories.
   * @param {string} tenantId
   * @param {string} businessId
   * @param {string} year
   * @param {boolean} [reconciledOnly = true]
   * @return {Promise<PLItem[]>}
   */
  async listBusinessPLCurrentYear (tenantId, businessId, year, reconciledOnly = true) {
    return this.raw(`SELECT c.type categoryType, categoryId, name, SUM(amount) amount
        FROM transactions
                 INNER JOIN accounts a on transactions.accountId = a.id
                 INNER JOIN categories c on transactions.categoryId = c.id
        WHERE transactions.tenantId = ? AND
          a.visible = 1 AND
          c.isPersonal = 0 AND
          ${getReconciledClause(reconciledOnly)}
          transactions.businessId = ? AND
         YEAR(postedDate) = ?
        GROUP BY categoryType, categoryId, name
        ORDER BY categoryType DESC, amount;`,
      [tenantId, businessId, year])
  }
}

/**
 * @typedef {Object} PLItem
 * @property {string} categoryId
 * @property {string} categoryType
 * @property {string} name
 * @property {Number} amount
 */
