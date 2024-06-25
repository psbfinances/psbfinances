'use strict'

import axios from 'axios'
import { appController } from '../../shared/core/index.js'
import qs from 'qs'

export const endpoint = {
  ACCOUNTS: 'accounts',
  APPLICATION: 'application',
  ATTACHMENTS: 'attachments',
  AUTH: 'auth',
  BUDGET: 'budget',
  BUSINESSES: 'businesses',
  CARS: 'cars',
  CATEGORIES: 'categories',
  DASHBOARD: 'dashboard',
  DUPLICATE_TRANSACTIONS: 'duplicateTransactions',
  IMPORTS: 'imports',
  IMPORT_RULES: 'importRules',
  REPORTS: 'reports',
  TENANTS: 'tenants',
  TRANSACTIONS: 'transactions',
  TRIPS: 'trips',
  USERS: 'users'
}

const itemEndpoint = (endpoint, id) => `${endpoint}/${id}`

export class Api {
  api
  endPoint

  constructor (endpoint) {
    this.api = api()
    this.endPoint = `/${endpoint}`
  }

  /**
   * @param {Object} [params]
   * @return {Promise<*>}
   */
  async list (params) {
    const query = params ? `?${qs.stringify(params)}` : ''
    return (await this.api.get(`${this.endPoint}${query}`)).data
  }

  async get (id, query) {
    if (!id) return (await this.api.get(this.endPoint)).data
    if (query) {
      const q = qs.stringify(query)
      return (await this.api.get(`${itemEndpoint(this.endPoint, id)}?${q}`)).data
    }
    return (await this.api.get(itemEndpoint(this.endPoint, id))).data
  }

  /**
   * Calls `POST` API - update item
   * @template T
   * @param {T} data
   * @return {Promise<T|{errors: {}}>}
   */
  async post (data) {
    return (await this.api.post(this.endPoint, data)).data
  }

  async put (id, data) {
    return (await this.api.put(itemEndpoint(this.endPoint, id), data)).data
  }

  async patch (id, data) {
    return (await this.api.patch(itemEndpoint(this.endPoint, id), data)).data
  }

  async delete (id) {
    return (await this.api.delete(itemEndpoint(this.endPoint, id))).data
  }
}

/**
 *
 * @param {string} baseUrl
 */
export const api = (baseUrl = '/api/') => {
  const result = axios.create({
    baseURL: baseUrl,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    },
    timeout: 5000
  })

  result.interceptors.request.use(config => {
    if (!appController.authenticated) return config

    const token = appController.token
    config.headers.authorization = `Bearer ${token}`
    return config
  }, error => {
    return Promise.reject(error)
  })

  result.interceptors.response.use(undefined, error => {
    if (error && error.response && error.response.status) {
      switch (error.response.status) {
        case 401:
          appController.logout()
          if (error.config.url !== '/auth/login') return window.location = '/'
          break
        case 500:
          return window.location = 'error'
      }
    }
  })

  return result
}
