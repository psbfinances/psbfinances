'use strict'

import Db from './db.js'

export default class ImportRuleDb extends Db {
  constructor () {
    super('importRules')
  }

  /**
   * Gets list of the rules.
   * @param {string} tenantId
   * @return {Promise<DipRule[]>}
   */
  async list(tenantId) {
    return this.knex.from(this.tableName).
      where({tenantId})
  }

  /**
   *
   * @param {DipRule} data
   * @return {Promise<*>}
   */
  async insert(data) {
    const dbData = data.toDb()
    return this.knex.insert(dbData)
  }
}
