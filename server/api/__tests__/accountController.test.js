'use strict'

import { beforeEach, expect, jest } from '@jest/globals'
import { initConfig } from '../../config/index.js'
import { AccountDb, TransactionDb } from '../../db/index.js'
import { controller } from '../accountController.js'

beforeAll(async () => {
  await initConfig()
})
beforeEach(() => jest.clearAllMocks())

/** processGet */
describe('processGet', () => {
  const tenantId = 'ten-01'
  const id = 'acc-01'
  const userId = 'usr-01'

  /** @type {FinancialAccount} */
  let account
  beforeEach(() => {
    account = {
      id,
      shortName: 'Visa Temp',
      fullName: 'Visa Temp',
      type: 'CC',
      bankId: null,
      closed: 1,
      visible: 0,
      deleted: 0,
      businessId: null,
      isDefault: 0,
      openingBalance: 0,
      balance: 0,
      format: null,
      meta: null,
      note: null,
      createdAt: '2021-12-08T16:27:58.000Z'
    }
    AccountDb.prototype.get = jest.fn().mockResolvedValueOnce([account])
  })

  it('returns opening balance if current balance of 0 is passed', async () => {
    TransactionDb.prototype.getTotalAmountByAccount = jest.fn().mockResolvedValueOnce([{total: 25010}])
    const actual = await controller.processGet(tenantId, userId, id, {currentBalance: '0'})
    expect(actual.openingBalance).toBe(-250.10)
  })

  it('returns opening balance if current balance of -1000.10 is passed', async () => {
    TransactionDb.prototype.getTotalAmountByAccount = jest.fn().mockResolvedValueOnce([{total: 25010}])
    const actual = await controller.processGet(tenantId, userId, id, {currentBalance: '-1000.10'})
    expect(actual.openingBalance).toBe(-1250.20)
  })
})
