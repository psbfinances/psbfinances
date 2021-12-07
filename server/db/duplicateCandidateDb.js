'use strict'

import Db from './db.js'

export default class DuplicateCandidateDb extends Db {
  constructor () {
    super('duplicateCandidates')
  }

  /**
   *
   * @param {string[]} ids
   * @return {Promise<DuplicateCandidate[]>}
   */
  async listByTransactionIds (ids) {
    return this.knex.where({ resolved: 0 }).whereIn('transactionId', ids).select()
  }

  async listByTransaction (transactionId) {
    return this.knex.where({transactionId}).orWhere({duplicateId: transactionId}).select()
  }

  async update({ id, tenantId, ...fields }) {
    return this.knex.where({ id }).update(fields)
  }

  /**
   * Inserts duplicate candidates.
   * @param {DuplicateCandidate} data
   * @return {Promise<void>}
   */
  async insert (data) {
    await this.knex.insert(data)
    /** @type {DuplicateCandidate} */
    const reversedData = {
      transactionId: data.duplicateId, duplicateId: data.transactionId, importId: data.importId, resolved: false
    }
    await this.knex.insert(reversedData)
  }
}
