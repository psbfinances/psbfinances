'use strict'

import store from 'store'

/**
 * @typedef {Object} AppController
 * @property {Object|null} user
 * @property {boolean} authenticated
 * @property {?string} token
 * @property {function} save
 * @property {function} load
 * @property {function} logout
 * @property {function} setAuthentication
 */

/**
 * Application controller.
 */
const appController = {
  user: null,
  token: null,

  /**
   * Checks whether user is authenticated.
   * @return {boolean}
   */
  get authenticated () {
    if (user) return true

    const user = store.get('user')
    return user !== null && user !== undefined
  },

  setAuthentication (user, token) {
    appController.user = user
    appController.token = token
    appController.saveAuthData()
  },

  saveAuthData: () => {
    store.set('user', appController.user)
    store.set('token', appController.token)
  },

  load: () => {
    appController.user = store.get('user')
    appController.token = store.get('token')
  },

  logout: () => {
    appController.user = null
    appController.token = null
    store.remove('user')
    store.remove('token')
  }

}

export default appController
