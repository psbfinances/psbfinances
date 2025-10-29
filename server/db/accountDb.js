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

  async listWithExtras (tenantId, includeBalance = false, includeUnreconciled = false) {
    const query = `
        SELECT
          a.id,
          (a.openingBalance + COALESCE(SUM(CASE WHEN t.reconciled = 1 THEN t.amount END), 0)) / 100 as balance,
          COUNT(CASE WHEN t.reconciled = 0 THEN 1 END) as unreconciledCount
      FROM accounts a
      LEFT JOIN transactions t ON a.id = t.accountId
          AND t.source = 'i'
          AND t.deleted = 0
          AND t.parentId IS NULL
      WHERE a.tenantId = ?
          AND a.deleted = 0
      GROUP BY a.id, a.openingBalance;`
    return this.raw(query, [tenantId])
  }

  async getWithExtras (id, tenantId, includeBalance = false, includeUnreconciled = false) {
    let selectClause = 'accounts.*'
    let fromClause = 'accounts'
    let whereClause = "accounts.tenantId = ? AND accounts.id = ? AND t_balance.reconciled = 1 AND t_balance.source = 'i' "
    let groupByClause = ''

    if (includeBalance && includeUnreconciled) {
      selectClause += `,
        COALESCE(SUM(t_balance.amount), 0) + accounts.openingBalance as currentBalance,
        (SELECT COUNT(*) FROM transactions t_unrec
         WHERE t_unrec.accountId = accounts.id AND t_unrec.reconciled = 0 AND t_unrec.source = 'i') as unreconciledCount`
      fromClause += ' LEFT JOIN transactions t_balance ON accounts.id = t_balance.accountId'
      groupByClause = 'GROUP BY accounts.id'
    } else if (includeBalance) {
      selectClause += ', COALESCE(SUM(t_balance.amount), 0) + accounts.openingBalance as currentBalance'
      fromClause += ' LEFT JOIN transactions t_balance ON accounts.id = t_balance.accountId'
      groupByClause = 'GROUP BY accounts.id'
    } else if (includeUnreconciled) {
      selectClause += ', COUNT(t_unreconciled.id) as unreconciledCount'
      fromClause += ' LEFT JOIN transactions t_unreconciled ON accounts.id = t_unreconciled.accountId '
      groupByClause = 'GROUP BY accounts.id'
    }

    const query = `
      SELECT ${selectClause}
      FROM ${fromClause}
      WHERE ${whereClause}
      ${groupByClause}
    `
    return this.raw(query, [tenantId, id])
  }
}
