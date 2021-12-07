'use strict'

import Db from './db.js'

export default class CategoryDb extends Db {
  constructor () {
    super('categories')
  }

  async list(tenantId) {
    return this.knex.where({ tenantId }).select().orderBy('isPersonal', 'desc').orderBy('type', 'desc').orderBy('name')
  }
}
