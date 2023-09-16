'use strict'

import api from './api/index.js'

/**
 * Defines routes.
 * @param {Express} app - express server.
 * @return {void}
 */
export default (app) => {
  // app.use(function(req, res, next) {
  //   res.header("Cross-Origin-Embedder-Policy", "require-corp");
  //   res.header("Cross-Origin-Opener-Policy", "same-origin");
  //   next();
  // })
  app.use('/api', api)
}
