'use strict'

import { Api } from './api.js'

const demoDataUrl = `application/demo-data`

export default class ApplicationApi extends Api {
  constructor (endpoint) {
    super(endpoint)
  }

  /**
   * @link module:psbf/api/application
   * @return {Promise<GetResponse>}
   */
  async get () {
    return (await this.api.get(this.endPoint)).data
  }

  async postDemoData () {
    return this.api.post(demoDataUrl)
  }

  async deleteDemoData () {
    return this.api.delete(demoDataUrl)
  }
}
