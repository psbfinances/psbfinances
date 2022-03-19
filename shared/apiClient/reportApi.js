'use strict'

import { Api } from './api.js'
import queryString from 'query-string'

export default class ReportApi extends Api {
  constructor (endpoint) {
    super(endpoint)
  }

  /**
   * @param {string} year
   * @param {string} businessId
   * @return {AxiosResponse<YearTaxResponse>}
   */
  async getYearTaxes (year, businessId) {
    const query = queryString.stringify({year, businessId})
    return this.api.get(`/reports/year-tax?${query}`)
  }
}
