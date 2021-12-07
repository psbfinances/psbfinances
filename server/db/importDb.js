'use strict'

import Db from './db.js'

export default class ImportDb extends Db {
  constructor () {
    super('imports')
  }

  /**
   * Gets list of the latest imports.
   * @param {string} tenantId
   * @param {number} limit = 10
   * @return {Promise<Import[]>}
   */
  async list (tenantId, limit = 10) {
    return this.knex.from(this.tableName).
      where({ tenantId }).
      where({ step: 'end' }).
      limit(10).
      orderBy([{ column: 'id', order: 'desc' }])
  }

  async insert (data) {
    const dbData = { ...data }
    dbData.counts = JSON.stringify(data.counts)
    dbData.stats = JSON.stringify(data.stats)
    if (data.fileInfo) dbData.fileInfo = JSON.stringify(data.fileInfo)
    return this.knex.insert(dbData)
  }

  async delete ({ id, tenantId, processId }) {
    await this.knex.client.raw(
      'DELETE FROM trips WHERE transactionId IN (SELECT id FROM transactions WHERE importProcessId = ? AND tenantId = ?);', [processId, tenantId])
    await this.knex.table('transactions').where({ importProcessId: processId, tenantId }).delete()
    await this.knex.table('imports').where({ id, tenantId }).delete()
    await this.knex.table('dataChanges').where({ tenantId, importProcessId: processId }).delete()
    await this.knex.table('duplicateCandidates').where({ importId: processId }).delete()
    await this.knex.table('importRuleTransactions').where({ tenantId, importId: processId }).delete()
  }
}
