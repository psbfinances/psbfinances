'use strict'

import Db from './db.js'

export default class UserDb extends Db {
  constructor () {
    super('users')
  }

  async list (tenantId) {
    return this.knex.where({ tenantId }).
      columns(['id', 'nickname', 'fullName', 'email', 'hasAccess']).select().orderBy(['fullName'])
  }

  /**
   * Gets user by email.
   * @param email
   * @return {Promise<User[]>}
   */
  async getByEmail (email) {
    return this.knex.where({ email }).select()
  }
}
