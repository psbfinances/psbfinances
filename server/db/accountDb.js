'use strict'

import Db from './db.js'

export default class AccountDb extends Db {
  constructor () {
    super('accounts')
    this.tCol = {
      isDefault: '',
      closed: '',
      type: '',
      shortName: ''
    }
    Object.keys(this.tCol).forEach(x => this.tCol[x] = x)
  }

  async list (tenantId) {
    return this.knex.where({ tenantId }).select().orderBy([
      this.tCol.closed,
      this.tCol.type,
      this.tCol.shortName])
  }

  async getDefault (tenantId) {
    return this.knex.where({ tenantId, isDefault: 1 }).select()
  }

  async update ({ id, tenantId, ...fields }) {
    if (fields.meta) fields.meta = JSON.stringify(fields.meta)
    return this.knex.where({ tenantId, id }).update({ ...fields })
  }

  async updateOpeningBalance (tenantId, id, openingBalance) {
    return this.knex.where({ tenantId, id }).update({ openingBalance })
  }

  async updateBalances (tenantId) {
    const query = `
      UPDATE accounts
          JOIN (
          SELECT accountId, sum(amount) AS total
          FROM transactions
          WHERE tenantId = ?
          GROUP BY accountId) AS totals ON accounts.id = totals.accountId
      SET balance = totals.total;
    `
    return this.knex.raw(query, [tenantId])
  }
}
