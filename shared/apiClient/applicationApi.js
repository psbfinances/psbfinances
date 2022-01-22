'use strict'

import { Api } from './api.js'

export default class ApplicationApi extends Api {
  constructor (endpoint) {
    super(endpoint)
  }

  async postDemoData () {
    return this.api.post('/application/demo-data')
  }

  async deleteDemoData () {
    return this.api.delete('/application/demo-data')
  }
}
