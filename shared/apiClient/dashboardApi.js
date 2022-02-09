'use strict'

import { Api } from './api.js'

export default class DashboardApi extends Api {
  constructor (endpoint) {
    super(endpoint)
  }

  /**
   * @param {string} period
   * @param {string} year
   * @param {string} businessId
   * @param {boolean} reconciledOnly
   * @return {AxiosResponse<*>}
   */
  async get (period, year, businessId, reconciledOnly) {
    return this.api.get(`/dashboard?year=${year}&period=${period}&businessId=${businessId}&reconciledOnly=${reconciledOnly}`)
  }
}
