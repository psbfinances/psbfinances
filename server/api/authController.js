'use strict'

import sha256 from 'crypto-js/sha256.js'
import jsonwebtoken from 'jsonwebtoken'
import express from 'express'
import asyncHandler from 'express-async-handler'
import crypto from 'crypto'
import { initConfig, config } from '../config/index.js'
import { UserDb, ExpiredTokenDb } from '../db/index.js'
import { getLogger } from '../core/index.js'
import { controller as tenantController } from './tenantController.js'

const logger = getLogger(import.meta.url)

const getCredentials = reqBody => {
  let { email, password } = reqBody
  email = email.toLowerCase().trim()
  password = password.trim()
  return { email, password }
}

const getCookieExpiration = () => {
  return { expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) }
}

const controller = {
  postLogin: async (req, res, next) => {
    try {
      await initConfig()
      let { email, password } = getCredentials(req.body)
      const { user, token } = await controller.login(email, password)
      res.cookie('psbf', token, getCookieExpiration()).json({ user, token })
    } catch (err) {
      return err.message === 'Invalid credentials' ? res.json({ error: 'Invalid email or password' }) : next(err)
    }
  },

  /**
   * @param {string} email
   * @param {string} password
   * @return {Promise<LoginResponse>}
   */
  login: async (email, password) => {
    logger.info('login', { email })

    const userDb = new UserDb()
    const rows = await userDb.getByEmail(email)
    if (rows.length !== 1) throw new Error('Invalid credentials')

    const psw = sha256(password).toString()
    if (rows[0].password !== psw) throw new Error('Invalid credentials')

    const { id, nickname } = rows[0]
    const token = jsonwebtoken.sign({ email }, config.jwt.secret, { expiresIn: config.jwt.expirationPeriod })
    return { user: { id, nickname, email }, token }
  },

  postSignUp: async (req, res, next) => {
    try {
      await initConfig()
      let { email, password } = getCredentials(req.body)
      const { user, token } = await controller.signUp(email, password)
      res.cookie('psbf', token, getCookieExpiration()).json({ user, token })
    } catch (err) {
      return err.message === 'Existing email' ? res.json({ error: 'Existing email' }) : next(err)
    }
  },

  /**
   * @param {string} email
   * @param {string} password
   * @return {Promise<LoginResponse>}
   */
  signUp: async (email, password) => {
    logger.info('signUp', { email })

    const userDb = new UserDb()
    const rows = await userDb.getByEmail(email)
    if (rows.length > 0) throw new Error('Existing email')

    const { user } = await tenantController.create(email, password)

    const { id, nickname } = user
    const token = jsonwebtoken.sign({ email }, config.jwt.secret, { expiresIn: config.jwt.expirationPeriod })
    return { user: { id, nickname, email }, token }
  },

  postLogout: async (req, res) => {
    logger.info('logout')

    try {
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]

      const tokenHash = crypto.createHash('sha256').update(token).digest('base64')
      const expiredTokenDb = new ExpiredTokenDb()
      await expiredTokenDb.insert({ id: tokenHash, createdDateTime: new Date() })

      res.clearCookie('psbf')
      return res.json({})
    } catch (err) {
      logger.error('postLogout', { error: err.stack })
    }
  }

}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/login').post(asyncHandler(controller.postLogin))
router.route('/signup').post(asyncHandler(controller.postSignUp))
router.route('/logout').post(asyncHandler(controller.postLogout))

export default router
export {
  controller
}
