'use strict'

import qs from 'qs'
import { Api } from './api.js'
import { c } from '../core/index.js'

export default class TransactionApi extends Api {
  constructor (endpoint) {
    super(endpoint)
  }

  /**
   * Gets list of tenant businesses.
   * @param params
   */
  async list (params) {
    const { accountId, categoryId, dateFrom, dateTo, search, businessId, importProcessId } = params
    let q = {}
    if (importProcessId) {
      q.importProcessId = importProcessId
    } else {
      if (accountId && accountId !== c.selectId.ALL) q.accountId = accountId
      if (categoryId && categoryId !== c.selectId.ALL) q.categoryId = categoryId
      if (dateFrom) q.dateFrom = dateFrom
      if (dateTo) q.dateTo = dateTo
      if (search) q.search = search
      if (businessId) q.businessId = businessId
      if (businessId) q.businessId = businessId
    }
    const query = qs.stringify(q)
    return (await this.api.get(`${this.endPoint}?${query}`)).data
  }

  async listDescriptionsLookup (query) {
    return this.list({ search: `q:${query}` })
  }

  async listChildrenTransactions (id) {
    return (await this.api.get(`${this.endPoint}/${id}/transactions`)).data
  }

  async listAttachments (id) {
    return (await this.api.get(`${this.endPoint}/${id}/attachments`)).data
  }

  async postAttachment (id, data) {
    return this.api.post(`${this.endPoint}/${id}/attachments`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * @link module:psbf/api/transactions
   * @param {string} id first transaction id
   * @param {string} mergeId second transaction id
   * @return {Promise<UpdateMergeResponse>}
   */
  async patchMerge (id, mergeId) {
    return this.api.patch(`${this.endPoint}/${id}/merge`, { mergeId })
  }

  async deleteAttachment (id, attachmentId) {
    return this.api.delete(`${this.endPoint}/${id}/attachments/${attachmentId}`)
  }

}
