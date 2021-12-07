'use strict'

// import * as path from 'path'
import api from './api/index.js'
// import { c } from './core/index.js'
// import express from 'express'
// import { dirname } from 'path'
// import { fileURLToPath } from 'url'

// const staticFilesFolder = process.env.NODE_ENV === c.environments.DEV ? '../web' : 'public'
// const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Defines routes.
 * @param {Express} app - express server.
 * @return {void}
 */
export default (app) => {
  app.use('/api', api)
}
