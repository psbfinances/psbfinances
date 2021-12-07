'use strict'

import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { getLogger } from '../core/index.js'
import { ExpiredTokenDb, UserDb } from '../db/index.js'
import crypto from 'crypto'

const logger = getLogger(import.meta.url)

export default {
  /**
   *
   * @param {AppRequest} req
   * @param {Response} res
   * @param {function} next
   * @return {Promise<void>}
   */
  authenticate: async (req, res, next) => {
    logger.debug('authenticate', {token: req.headers['authorization'], cookieToken: req.cookies['psbf']})
    const authHeader = req.headers['authorization']
    const cookieToken = req.baseUrl.includes(config.filesFolder) ? req.cookies['psbf'] : null
    const headerToken = authHeader && authHeader.split(' ')[1]
    const token = headerToken || cookieToken
    if (token == null) return res.sendStatus(401)

    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('base64')
      const expiredTokenDb = new ExpiredTokenDb()
      const expiredTokens = await expiredTokenDb.get(tokenHash)
      if (expiredTokens.length > 0) return res.sendStatus(401)

      const user = await jwt.verify(token, config.jwt.secret)
      const userDb = new UserDb()
      const dbUser = await userDb.getByEmail(user.email)
      const { password, ...userData } = dbUser[0]
      req.user = userData
      next()
    } catch (e) {
      if (e.name === 'TokenExpiredError') return res.sendStatus(401)

      logger.error('authenticate', {error: e.stack})
      return res.sendStatus(500)
    }
  }
}
