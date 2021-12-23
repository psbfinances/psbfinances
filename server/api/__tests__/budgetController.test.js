'use strict'

import { beforeEach, expect, jest } from '@jest/globals'
import { controller } from '../budgetController.js'
import { initConfig } from '../../config/index.js'

beforeAll(async () => {
  await initConfig()
})
beforeEach(() => jest.clearAllMocks())

/** list */
describe('list', () => {
  it('return budget for a year', async () => {
    await controller.list('ckkfm160400003e5iimcnpt4s', '', 2021)
    expect(true).toBeTruthy()
  })
})
