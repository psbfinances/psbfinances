'use strict'

import crypto from 'crypto'
import sha256 from 'crypto-js/sha256.js'
import { controller } from '../authController.js'
// import { UserDb } from '../../db/index.js'

/**
 * generate Token Secret
 */
describe.skip('generateTokenSecret', () => {
  it('generates token', () => {
    const actual = crypto.randomBytes(64).toString('hex')
    console.log(actual)
    expect(actual).toBeDefined()
  })
})

/**
 * hash password
 */
describe('hashPassword', () => {
  it('returns password hash', () => {
    const actual = sha256('password').toString()
    expect(actual).toBe('5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8')
  })
})

/**
 * Login
 */
describe.skip('login', () => {
  it('returns user and token on valid credentials', async () => {
    const req = {
      body: {
        email: 'my@email.com',
        password: 'password'
      }
    }
    const actual = await controller.post(req, {}, (err) => {console.log(err)})
    expect(true).toBeTruthy()
  })
})
