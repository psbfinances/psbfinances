'use strict'

import sha256 from 'crypto-js/sha256.js'
import jsonwebtoken from 'jsonwebtoken'
import express from 'express'
import asyncHandler from 'express-async-handler'
import crypto from 'crypto'
import validator from 'validator'
import { initConfig, config } from '../config/index.js'
import { UserDb, ExpiredTokenDb } from '../db/index.js'
import { getLogger } from '../core/index.js'
import { controller as tenantController } from './tenantController.js'
import jwt from 'jsonwebtoken'

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

  /**
   * Resets user password.
   * @property {AppRequest} req
   * @property {Object} req.body
   * @property {string} req.body.email
   * @property {Response} response
   * @return {void}
   */
  postResetPassword: async (req, res) => {
    const resul = await controller.resetPassword(req.body.email)
    res.status(202).json(resul)
  },

  /**
   * Handles Reset Password request
   * @param userEmail
   * @return {Promise<{error: string}|{}>}
   */
  resetPassword: async userEmail => {
    logger.info('resetPassword', { userEmail })
    try {
      const token = await controller.generateResetPasswordToken(userEmail)
      logger.debug('resetPassword', { token })
      return {}
    } catch (e) {
      logger.error('resetPassword', {error: e.stack})
      return {error: e.message}
    }
  },

  /**
   * Generates password reset token based on user email and hashed password.
   * @param {string} userEmail
   * @throws Error
   * @return {Promise<string>}
   */
  generateResetPasswordToken: async userEmail => {
    logger.info('generateResetPasswordToken', { userEmail })
    if (!validator.isEmail(userEmail)) throw new Error('Invalid email')
    const email = userEmail.toLowerCase()

    const userDb = new UserDb()
    const users = await userDb.getByEmail(email)
    if (users.length === 0) throw new Error('Invalid email')

    const user = users[0]
    const password = sha256(user.password).toString()
    return jsonwebtoken.sign({ email, password }, config.jwt.secret, { expiresIn: '1d' })
  },

  /**
   * Checks whether password reset token is valid and not expired..
   * @property {AppRequest} req
   * @property {Object} req.body
   * @property {string} req.body.token
   * @property {Response} response
   * @return {{valid: boolean}}
   */
  postValidateResetPasswordToken: async (req, res) => {
    const token = req.body.token
    const result = await controller.validateResetPasswordToken(token)
    res.json(result)
  },

  validateResetPasswordToken: async (token, secret = config.jwt.secret) => {
    try {
      const result = await jwt.verify(token, secret)
      const { email, password } = result
      const userDb = new UserDb()
      const users = await userDb.getByEmail(email)
      const user = users[0]
      const dbPassword = sha256(user.password).toString()
      if (dbPassword !== password) return { valid: false }
    } catch (e) {
      logger.error('validateResetPasswordToken', { error: e.stack })
      return { valid: false }
    }
    return { valid: true }
  },

  /**
   * Saves new password on reset.
   * @property {AppRequest} req
   * @property {Object} req.body
   * @property {string} req.body.token
   * @property {string} req.body.password
   * @property {Response} response
   * @return {{result: boolean, error: ?string}}   */
  postSavePassword: async (req, res) => {
    logger.info('postSavePassword')
    const { token, password } = req.body
    const result = await controller.savePassword(token, password)
    res.json(result)
  },

  savePassword: async (token, password) => {
    logger.info('savePassword', token)
    if (validator.isEmpty(token) || !validator.isStrongPassword(password)) {
      return { result: false, error: 'Password is not strong enough' }
    }
    try {
      const result = await jwt.verify(token, config.jwt.secret)
      const { email, password: oldPassword } = result
      const userDb = new UserDb()
      const users = await userDb.getByEmail(email)
      const user = users[0]
      const { id, tenantId, password: currentPassword } = user
      if (oldPassword !== sha256(currentPassword).toString()) return { valid: false, error: 'Expired token' }

      const psw = sha256(password).toString()
      await userDb.update({ id, tenantId, password: psw })
    } catch (e) {
      logger.error('savePassword', { token, error: e.stack })
      return { result: false, error: '500' }
    }
    return { result: true }
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
router.route('/password-reset').post(asyncHandler(controller.postResetPassword))
router.route('/token-validate').post(asyncHandler(controller.postValidateResetPasswordToken))
router.route('/password').post(asyncHandler(controller.postSavePassword))

export default router
export {
  controller
}
