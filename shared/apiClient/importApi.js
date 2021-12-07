'use strict'

import { Api } from './api.js'

export default class ImportApi extends Api {
  constructor (endpoint) {
    super(endpoint)
  }

  async post (data) {
    return this.api.post(this.endPoint, data)
  }
}

/**
 * @typedef {Object} ImportPostRequest
 * @property {Object} data
 */
