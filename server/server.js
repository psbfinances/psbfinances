'use strict'

import express from 'express'
import routes from './routes.js'
import http from 'http'
import configExpress from './config/express.js'
import getLogger from './core/logger.js'
import { initConfig, config } from './config/index.js'
import { auth } from './middleware/index.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { run } from './deployDb.js'
import initApp from './initApp.js'

const logger = getLogger(import.meta.url)
const app = express()
const server = http.createServer(app)

const logError = (message, promise, error) => logger.error(message, { promise, error, stack: error.stack })
const dirname = path.dirname(fileURLToPath(import.meta.url))

const updateDb = async () => {
  logger.info('updateDb')
  try {
    await run()
  } catch (err) {
    logger.error('updateDb', { err })
  }
}

const appServer = {

  /**
   * Initializes the server.
   * @param {Object} [options]
   * @returns {void}
   */
  init: async (options = {}) => {
    logger.info('init', options)

    process.on('unhandledRejection', (error, promise) => logError('onUnhandledRejection', promise, error))
    server.on('error', (error, promise) => logError('onServerError', promise, error))

    await initConfig()
    await updateDb()

    config.rootFolder = dirname
    configExpress(app, routes, auth)
  },

  /**
   * Starts the server.
   * @return {void}
   */
  start: () => {
    server.listen(config.port, () => logger.info('start', { port: config.port }))
  }
}

initApp.createFolders()
await appServer.init()
appServer.start()
