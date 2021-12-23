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

  async resetPassword (email) {
    return this.api.post(`${this.endPoint}/password-reset`, {email})
  }

  async logout () {
    return this.api.post(`${this.endPoint}/logout`)
  }

  async validateToken (token) {
    return this.api.post(`${this.endPoint}/token-validate`, {token})
  }

  async savePassword (token, password) {
    return this.api.post(`${this.endPoint}/password`, {token, password})
  }
}
