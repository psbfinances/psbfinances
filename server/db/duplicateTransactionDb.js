'use strict'

import Db from './db.js'

export default class DuplicateTransactionDb extends Db {
  constructor () {
    super('duplicates')
  }

  /**
   * Returns data by external id.
   * @param {string} externalUid
   * @param {string} tenantId
   * @return {string[]}
   */
  async getByExternalUid (externalUid, tenantId) {
    return this.knex.columns(['id']).where({ externalUid, tenantId }).select()
  }

  /**
   * Returns data by parent transaction.
   * @param {string} parentTransactionId
   * @param {string} tenantId
   * @return {Promise<Object[]>}
   */
  async listByParentTransactionId (parentTransactionId, tenantId) {
    return this.knex.columns(['id', 'transactionData']).where({ parentTransactionId, tenantId }).select()
  }

  /**
   * Inserts a transaction.
   * @param {string} tenantId
   * @param {string} transactionId
   * @param {string} parentTransactionId
   * @param {Transaction} transactionData
   * @param {string} externalUid
   * @return {Promise<*>}
   */
  async insert (tenantId, transactionId, parentTransactionId, transactionData, externalUid) {
    const dbData = {
      tenantId,
      transactionId,
      parentTransactionId,
      transactionData: JSON.stringify(transactionData),
      externalUid
    }
    return this.knex.insert(dbData)
  }
}
