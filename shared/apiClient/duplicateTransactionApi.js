'use strict'

import { Api } from './api.js'

export default class DuplicateTransactionApi extends Api {
  constructor (endpoint) {
    super(endpoint)
  }

  /**
   * Gets transactions by parent transaction id
   * @param {string} id parent transaction id.
   * @return {Promise<*>}
   */
  async listByParentTransactionId (id) {
    return this.api.get(`${this.endPoint}/${id}`)
  }

  /**
   * Marks transaction as not-a-duplicate.
   * @param {string} id
   * @return {Promise<*>}
   */
  async resolve (id) {
    return this.api.patch(`${this.endPoint}/${id}/resolve`)
  }

  /**
   * Undo marks transaction as duplicate.
   * @param {string} id
   * @return {Promise<*>}
   */
  async undo (id) {
    return this.api.patch(`${this.endPoint}/${id}/undo`)
  }
}
