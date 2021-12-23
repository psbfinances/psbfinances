'use strict'

import api from './api/index.js'

/**
 * Defines routes.
 * @param {Express} app - express server.
 * @return {void}
 */
export default (app) => {
  app.use('/api', api)
}
