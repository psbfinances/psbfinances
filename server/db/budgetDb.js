'use strict'

import Db from './db.js'

const listColumns = ['id', 'monthNo', 'categoryId', 'amount', 'comment']

export default class BudgetDb extends Db {
  constructor () {
    super('budgets')
  }

  /**
   * List budget with criteria.
   * @param {Object} criteria
   * @param {string} criteria.tenantId
   * @param {number} criteria.year
   * @param {string} [criteria.categoryId]
   * @return {Promise<[psbf.Budget]>}
   */
  async listByCriteria (criteria) {
    const query = this.knex.where({ ...criteria })
    return query.columns(listColumns).select()
  }

  /**
   * List budget by year month.
   * @param tenantId
   * @param year
   * @param monthNo
   * @param monthOnly
   * @return {Promise<[psbf.Budget]>}   */
  async listByYearAndMonth (tenantId, year, monthNo, monthOnly = true) {
    const query = monthOnly
      ? this.knex.where({ tenantId, year, monthNo })
      : this.knex.where({ tenantId, year }).andWhere('monthNo', '<=', monthNo)
    return query.columns(listColumns).select()
  }

  /**
   * Clones year budget from previous year.
   * @param tenantId
   * @param year
   * @return {Promise<*>}
   */
  async clone (tenantId, year) {
    return this.raw(`INSERT INTO budgets (tenantId, year, monthNo, categoryId, amount, comment)
      SELECT tenantId, :year AS year, monthNo, categoryId, amount, comment FROM budgets
      WHERE tenantId=:tenantId AND year=:prevYear;`,
      {tenantId, year, prevYear: year -1})
  }
}
