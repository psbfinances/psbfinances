'use strict'

import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import errorHandler from 'errorhandler'
import expressWinston from 'express-winston'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import helmet from 'helmet'
import fileUpload from 'express-fileupload'
import { getLogger, c, AppError } from '../core/index.js'
import api from '../api/index.js'
import { controller } from '../api/attachmentController.js'
import path from 'path'

const logger = getLogger(import.meta.url)
const env = process.env.NODE_ENV || c.environments.DEV

const requestLoggerOptions = {
  winstonInstance: logger,
  meta: false,
  msg: 'HTTP {{req.method}} {{req.url}} {{req.params}} BODY {{req.body}}',
  expressFormat: true,
  colorize: env === c.environments.DEV
}
const rateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 })

// noinspection JSUnusedLocalSymbols
/**
 * Handles express error by returning a proper response.
 * @param {Error|AppError} err
 * @param {Request} req
 * @param {import('express').Response} res
 * @param {function} next
 * @return {object}
 */
const appErrorHandler = (err, req, res, next) => {
  let errorInfo = { error: err.message, stack: err.stack }
  if (err instanceof AppError) errorInfo.meta = err.meta
  logger.error('appErrorHandler', errorInfo)
  return res.status(500).json({ error: 'Server error' })
}

/**
 * Handles 404 - resource not found request.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {Function}
 */
const handle404 = (req, res) => {
  logger.warn('express|handle404', {
    url: req.url,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
  })
  // const errorFile = path.resolve(`${config.publicPath}/error404.html`)
  //
  res.status(404)
  //
  // if (req.accepts('html')) {
  //   res.sendFile(errorFile)
  //   return
  // }

  if (req.accepts('json')) return res.send({ error: 'Not found JSON' })

  res.type('txt').send('Not found txt')
}

/**
 * Express configuration.
 * @param {import('express').Express} app
 * @param routes
 * @param auth
 * @return {void}
 */
export default (app, routes, auth) => {
  app.use(helmet())
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy',
      'default-src \'self\' 10.0.0.55; img-src \'self\' data: stackpath.bootstrapcdn.com 10.0.0.55; script-src \'self\' \'unsafe-inline\' code.jquery.com stackpath.bootstrapcdn.com cdn.jsdelivr.net 10.0.0.55; style-src \'unsafe-inline\' cdn.jsdelivr.net stackpath.bootstrapcdn.com use.fontawesome.com 10.0.0.55; font-src use.fontawesome.com')
    next()
  })

  app.use(cors())
  app.use(compression())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(cookieParser())
  app.enable('trust proxy')
  app.use(expressWinston.logger(requestLoggerOptions))
  app.use(rateLimiter)
  app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }))

  app.use('/api', api)
  if (process.env.NODE_ENV === c.environments.DEV) {
    app.use(express.static('../web/public'))
    app.use(errorHandler())
  } else {
    app.use(express.static('public'))
  }

  app.use('/app/files/*', auth.authenticate)
  app.get('/app/files/*', (req, res) => {
    return controller.getFile(req, res)
  })
  const staticFilesFolder = process.env.NODE_ENV === c.environments.DEV ? '../web' : 'public'
  app.get('/*', (req, res) => res.sendFile(path.resolve(staticFilesFolder, 'index.html')))

  app.use(handle404)
  app.use(appErrorHandler)
}
