'use strict'

import { Api } from './api.js'

export default class AuthApi extends Api {
  constructor (endpoint) {
    super(endpoint)
  }

  /**
   * Sends sign in request.
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.password
   * @return {Promise<{data: LoginResponse}>}
   */
  async login (params) {
    return this.api.post(`${this.endPoint}/login`, params)
  }

  /**
   * Sends sign up request.
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.password
   * @return {Promise<{data: LoginResponse}>}
   */
  async signUp (params) {
    return this.api.post(`${this.endPoint}/signup`, params)
  }

  async logout () {
    return this.api.post(`${this.endPoint}/logout`)
  }
}
