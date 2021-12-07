'use strict'

import model from '../transactionModel.js'
import cuid from 'cuid'
import { expect } from '@jest/globals'
import { c } from '../../core'

/** calcBalance */
describe('calcBalance', () => {
  it('returns 2 digits', () => {
    const actual = model.calcBalance(485.89, -400)

    expect(actual).toBe(85.89)
  })

  it('returns 0', () => {
    const actual = model.calcBalance(85.89, -85.89)

    expect(actual).toBe(0)
  })
})

/** calcBalanceAndNewMonth */
describe('calcBalanceAndNewMonth', () => {
  /** @type {Transaction[]} */
  let transactions
  let openingBalance = 0

  beforeEach(() => {
    transactions = [...basicTransactions]
  })

  it('calculates balance and new month', () => {
    transactions = [...basicTransactions, transaction5, transaction6, transaction7]
    const actual = model.calcBalanceAndNewMonth(openingBalance, transactions)

    expect(actual).toHaveLength(7)
    expect(actual[6]).toMatchObject({ id: transaction1.id, balance: -1000, isNewMonth: true })
    expect(actual[5]).toMatchObject({ id: transaction2.id, balance: -3000, isNewMonth: false })
    expect(actual[4]).toMatchObject({ id: transaction3.id, balance: 0, isNewMonth: true })
    expect(actual[3]).toMatchObject({ id: transaction4.id, balance: -4000, isNewMonth: false })
    expect(actual[2]).toMatchObject({ id: transaction7.id, balance: 0, isNewMonth: true })
    expect(actual[1]).toMatchObject({ id: transaction6.id, balance: 0, isNewMonth: false })
    expect(actual[0]).toMatchObject({ id: transaction5.id, balance: -9000, isNewMonth: false })
  })

  it('handles empty list', () => {
    transactions = []
    const actual = model.calcBalanceAndNewMonth(openingBalance, transactions)

    expect(actual).toHaveLength(0)
  })

  it('recalculates balance and new month when transaction is removed', () => {
    let actual = model.calcBalanceAndNewMonth(openingBalance, transactions)
    actual.splice(1, 1)
    actual = model.calcBalanceAndNewMonth(openingBalance, actual)

    expect(actual).toHaveLength(3)
    expect(actual[0]).toMatchObject({ id: transaction4.id, balance: -7000, isNewMonth: true })
    expect(actual[1]).toMatchObject({ id: transaction2.id, balance: -3000, isNewMonth: false })
    expect(actual[2]).toMatchObject({ id: transaction1.id, balance: -1000, isNewMonth: true })
  })

  it('recalculates balance and new month when transaction is added', () => {
    let actual = model.calcBalanceAndNewMonth(openingBalance, transactions)
    actual.push(transaction5)
    actual = model.calcBalanceAndNewMonth(openingBalance, actual)

    expect(actual).toHaveLength(5)
    expect(actual[0]).toMatchObject({ id: transaction5.id, balance: -9000, isNewMonth: true })
    expect(actual[1]).toMatchObject({ id: transaction4.id, balance: -4000, isNewMonth: false })
    expect(actual[2]).toMatchObject({ id: transaction3.id, balance: 0, isNewMonth: true })
    expect(actual[3]).toMatchObject({ id: transaction2.id, balance: -3000, isNewMonth: false })
    expect(actual[4]).toMatchObject({ id: transaction1.id, balance: -1000, isNewMonth: true })
  })
})

/** getNewManual */
describe('getNewManual', () => {
  it('returns new manual transaction', () => {
    const data = {
      'id': 'ckoa8gn6000003e644m9r40e8',
      'tenantId': 'tenant-01',
      'postedDate': '2021-05-04T16:15:25.393Z',
      'accountId': 'acc-01',
      'categoryId': null,
      'businessId': 'p',
      'amount': 2000,
      'description': 'Amazon',
      'note': ''
    }
    const actual = model.getNewManual(data)

    expect(actual).toStrictEqual(expect.objectContaining({
      'accountId': 'acc-01',
      'amount': 2000,
      'businessId': 'p',
      'categoryId': null,
      'completed': true,
      'deleted': false,
      'description': 'Amazon',
      'dipSourceId': null,
      'externalUid': null,
      'frequency': null,
      'hasChildren': false,
      'hasOpenTasks': false,
      'id': 'ckoa8gn6000003e644m9r40e8',
      'note': '',
      'originalDescription': null,
      'parentId': null,
      'reconciled': false,
      'scheduled': 0,
      'source': 'm',
      'sourceOriginalDescription': null,
      'tenantId': 'tenant-01'
    }))
    expect(actual.duplicateCandidateId).toBeUndefined()
  })
})

/** isEqual */
describe('isEqual', () => {
  it('returns true for same transactions', () => {
    const transaction1 = model.getNew('acc1')
    transaction1.id = model.getNewId()
    const transaction2 = {...transaction1}

    const actual = model.isEqual(transaction1, transaction2)

    expect(actual).toBeTruthy()
  })

  it('returns false for different transactions', () => {
    const transaction1 = model.getNew('acc1')
    transaction1.id = model.getNewId()
    /** @type {psbf.Transaction} */
    const transaction2 = {...transaction1}
    transaction2.description = 'New description'

    const actual = model.isEqual(transaction1, transaction2)

    expect(actual).toBeFalsy()
  })
})

/** calcReconsiledAndScheduled */
describe('calcReconsiledAndScheduled', () => {
  /** @type {typeof psbf.Transaction} */ let transaction

  it('returns always true scheduled for imported transactions', () => {
    transaction = { source: c.sources.IMPORT }
    let actual = model.calcReconsiledAndScheduled(transaction, undefined, true)
    expect(actual.scheduled).toBeTruthy()

    actual = model.calcReconsiledAndScheduled(transaction, undefined, false)
    expect(actual.scheduled).toBeTruthy()

    actual = model.calcReconsiledAndScheduled(transaction, true, undefined)
    expect(actual.scheduled).toBeTruthy()

    actual = model.calcReconsiledAndScheduled(transaction, false, undefined)
    expect(actual.scheduled).toBeTruthy()
  })

  it('returns values form scheduled and reconciled', () => {
    // true, true -> undefined,true => true, true
    transaction = { source: c.sources.MANUAL, scheduled: true, reconciled: true }
    let actual = model.calcReconsiledAndScheduled(transaction, undefined, true)
    expect(actual.scheduled).toBeTruthy()
    expect(actual.reconciled).toBeTruthy()

    // true, true -> undefined, false => true, false
    actual = model.calcReconsiledAndScheduled(transaction, undefined, false)
    expect(actual.scheduled).toBeTruthy()
    expect(actual.reconciled).toBeFalsy()

    // false, false -> true, undefined => true, false
    transaction = { source: c.sources.MANUAL, scheduled: false, reconciled: false }
    actual = model.calcReconsiledAndScheduled(transaction, true, undefined)
    expect(actual.scheduled).toBeTruthy()
    expect(actual.reconciled).toBeFalsy()

    // false, false -> false, undefined => false, false
    actual = model.calcReconsiledAndScheduled(transaction, false, undefined)
    expect(actual.scheduled).toBeFalsy()
    expect(actual.reconciled).toBeFalsy()
  })
})


const accountId = 'aac-01'
const transaction1 = model.getNew(accountId)
transaction1.id = cuid()
transaction1.postedDate = new Date(2021, 2, 1, 6, 0)
transaction1.amount = -1000
transaction1.hasChildren = false
transaction1.parentId = null

const transaction2 = model.getNew(accountId)
transaction2.id = cuid()
transaction2.postedDate = new Date(2021, 2, 31, 6, 0)
transaction2.amount = -2000
transaction2.hasChildren = false
transaction2.parentId = null

const transaction3 = model.getNew(accountId)
transaction3.id = cuid()
transaction3.postedDate = new Date(2021, 3, 1, 6, 0)
transaction3.amount = 3000
transaction3.hasChildren = false
transaction3.parentId = null

const transaction4 = model.getNew(accountId)
transaction4.id = cuid()
transaction4.postedDate = new Date(2021, 3, 10, 6, 0)
transaction4.amount = -4000
transaction4.hasChildren = false
transaction4.parentId = null

const transaction5 = model.getNew(accountId)
transaction5.id = cuid()
transaction5.postedDate = new Date(2021, 4, 10, 6, 0)
transaction5.amount = -5000
transaction5.hasChildren = true
transaction5.parentId = null

const transaction6 = model.getNew(accountId)
transaction6.id = cuid()
transaction6.postedDate = new Date(2021, 4, 10, 6, 0)
transaction6.amount = -2000
transaction6.hasChildren = false
transaction6.parentId = transaction5.id

const transaction7 = model.getNew(accountId)
transaction7.id = cuid()
transaction7.postedDate = new Date(2021, 4, 10, 6, 0)
transaction7.amount = -3000
transaction7.hasChildren = false
transaction7.parentId = transaction5.id

const basicTransactions = [
  transaction1, transaction2, transaction3, transaction4
]

