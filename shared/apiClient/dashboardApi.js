'use strict'

import { Api } from './api.js'

export default class DashboardApi extends Api {
  constructor (endpoint) {
    super(endpoint)
  }

  /**
   * @param {'cm'|'lm'} period
   * @param {string} year
   * @param {string} businessId
   * @return {AxiosResponse<*>}
   */
  async get (period, year, businessId) {
    return this.api.get(`/dashboard?year=${year}&period=${period}&businessId=${businessId}`)
  }
}
