'use strict'

import Db from './db.js'

export default class CategoryDb extends Db {
  constructor () {
    super('categories')
  }

  /**
   * List tenant categories.
   * @param {string} tenantId
   * @return {Promise<[psbf.Category]>}
   */
  async list(tenantId) {
    return this.knex.where({ tenantId }).select().orderBy('isPersonal', 'desc').orderBy('type', 'desc').orderBy('name')
  }
}
