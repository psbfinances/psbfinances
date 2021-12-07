'use strict'

import winston from 'winston'
import w from 'winston-daily-rotate-file'
import { c } from './constants.js'

const { combine, timestamp: ts, colorize, printf } = winston.format
const environment = process.env.NODE_ENV || c.environments.DEV

/**
 * Returns a logger.
 * @param {String} fileName
 * @returns {winston.Logger}
 */
const getLogger = fileName => {
  // TODO: filter out security data, like passwords, ...
  const script = fileName
    ? fileName.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.')
    : ''

  const fileTransport = new (winston.transports.DailyRotateFile)({
    filename: 'logs/psbF-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '7d'
  })

  const format = environment === c.environments.DEV
    ? combine(
      colorize(),
      ts(),
      printf(info => {
        const { timestamp, level, message, ...extra } = info

        return `${timestamp} [${level}]: ${script}|${message} ${Object.keys(extra).length
          ? JSON.stringify(extra)
          : ''}`
      }),
      ts({ format: 'YYYY-MM-DD HH:mm:ss' }))
    : combine(
      printf(info => {
        const { timestamp, level, message, ...extra } = info

        const result = Object.assign({ level, script, message }, extra)
        return JSON.stringify(result)
      }))

  const transports = [new winston.transports.Console()]
  if (environment === c.environments.PROD) transports.push(fileTransport)

  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format,
    transports
  })
}

export default getLogger
