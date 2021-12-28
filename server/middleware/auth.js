'use strict'

import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import NodeCache from 'node-cache'
import { config } from '../config/index.js'
import { getLogger } from '../core/index.js'
import { ExpiredTokenDb, UserDb } from '../db/index.js'
import utils from '../api/utils.js'

const logger = getLogger(import.meta.url)
const cache = new NodeCache()

export default {
  /**
   *
   * @param {AppRequest} req
   * @param {e.Response} res
   * @param {function} next
   * @return {Promise<void> | Promise<e.Response>}
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
      let userData = cache.get(utils.getUserCacheKey(user.email))
      if (userData === undefined) {
        const userDb = new UserDb()
        const dbUser = await userDb.getByEmail(user.email)
        userData = dbUser[0]
        delete userData.password
        cache.set(utils.getUserCacheKey(user.email), userData, 120)
      }
      if (!userData.hasAccess) return res.sendStatus(401)
      req.user = userData
      next()
    } catch (e) {
      if (e.name === 'TokenExpiredError') return res.sendStatus(401)

      logger.error('authenticate', {error: e.stack})
      return res.sendStatus(500)
    }
  }
}
