'use strict'

import crypto from 'crypto'
import sha256 from 'crypto-js/sha256.js'
import jwt from 'jsonwebtoken'
import { beforeEach, jest } from '@jest/globals'
import { controller } from '../authController.js'
import { UserDb } from '../../db/index.js'
import { initConfig } from '../../config/index.js'

beforeAll(async () => {
  await initConfig()
})
beforeEach(() => jest.clearAllMocks())

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

/** decode */
describe('decode', () => {
  it('decodes token', () => {
    const actual = jwt.verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZ2c0BzeWVyaWsuY29tIiwiaWF0IjoxNjM5NjU2MzY4LCJleHAiOjE2NDA5NTIzNjh9.OVSdOkXvY2wZuFZlcy1Zb6NSRJSV4QZSrf7dZnfbbgM',
      '8cf77c67298f98bc52b96b8689ee25bd9a5003fd890a074948e4002c3d7772a6016e81b19f05621d07cab51247d9961f317a470bca2b8ed359040d39db9d491f')
    console.log(actual)
    expect(true).toBeTruthy()
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
    await controller.post(req, {}, (err) => {console.log(err)})
    expect(true).toBeTruthy()
  })
})

/** generateResetPasswordToken */
describe('generateResetPasswordToken', () => {
  const user = {
    id: 'user1',
    email: 'joe@doe.com',
    password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
  }

  it('generates jwt for a valid email ', async () => {
    UserDb.prototype.getByEmail = jest.fn().mockResolvedValueOnce([user])
    const actual = await controller.generateResetPasswordToken(user.email)
    expect(actual.length).toBeGreaterThan(1)
  })
})

/** validateResetPasswordToken */
describe('validateResetPasswordToken', () => {
  const user = {
    id: 'user1',
    email: 'joe@doe.com',
    password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
  }
  const jwtSecret = user.password

  it('throws error if token expired', async () => {
    const expiredToken = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: 0 })
    // UserDb.prototype.getByEmail = jest.fn().mockResolvedValueOnce([user])
    const actual = await controller.validateResetPasswordToken(expiredToken, jwtSecret)
    expect(actual).toStrictEqual({valid: false})
  })

  it('throws error if token is valid but user has new password', async () => {
    const userWithNewPassword = {...user}
    userWithNewPassword.password = 'new-hashed-password'
    UserDb.prototype.getByEmail = jest.fn().mockResolvedValueOnce([userWithNewPassword])
    const tokenWithOldPassword = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: '1h' })

    const actual = await controller.validateResetPasswordToken(tokenWithOldPassword, jwtSecret)
    expect(actual).toStrictEqual({valid: false})
  })

  it('return valid if if token is valid and password did not change', async () => {
    UserDb.prototype.getByEmail = jest.fn().mockResolvedValue([user])
    const token = await controller.generateResetPasswordToken(user.email)

    const actual = await controller.validateResetPasswordToken(token)
    expect(actual).toStrictEqual({valid: true})
  })

})

/** savePassword */
describe('savePassword', () => {
  it('returns false if password is wrong', async () => {
    const actual = await controller.savePassword('token-does-not-matter', 'short')
    expect(actual.result).toBeFalsy()
    expect(actual.error).not.toBeNull()
  })

  it('saves new password', async () => {
    const user = {
      id: 'user1',
      email: 'joe@doe.com',
      password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
    }

    UserDb.prototype.update = jest.fn().mockResolvedValueOnce()
    UserDb.prototype.getByEmail = jest.fn().mockResolvedValue([user])
    const token = await controller.generateResetPasswordToken(user.email)
    const actual = await controller.savePassword(token, 'V7]"W}h$gn33')

    expect(actual.result).toBeTruthy()
    expect(UserDb.prototype.update).toHaveBeenCalled()
  })
})

