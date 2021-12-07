'use strict'

import Db from './db.js'

export default class ExpiredTokenDb extends Db {
  constructor () {
    super('expiredTokens')
  }

  async get (id) {
    return this.knex.from(this.tableName).where({id})
  }
}
