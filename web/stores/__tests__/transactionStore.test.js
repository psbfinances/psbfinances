'use strict'

import { beforeEach, jest } from '@jest/globals'
import { rootStore } from '../rootStore'
import { amazonCardTransactions, businesses } from '../../components/__tests__/data'
import { setupRootStore } from '../../components/__tests__/helper'
import { Api } from '../../../shared/apiClient/api'
import TransactionApi from '../../../shared/apiClient/transactionApi'
import { c } from '../../../shared/core/index.js'
import { transactionModel } from '@psbfinances/shared/models'

beforeAll(async () => {
  await setupRootStore()
})

/** saveSplits */
describe('saveSplits', () => {

  it('saves new splits', async () => {
    rootStore.transactionsStore.getChildTransactions()
    expect(rootStore.transactionsStore.editItem.hasChildren).toBeFalsy()
    expect(rootStore.transactionsStore.childTransactions).toHaveLength(2)

    const parentAmount = rootStore.transactionsStore.editItem.amount
    const amounts = [parentAmount * 10000 / 2 - 1, parentAmount * 10000 / 2 + 1]
    expect(amounts[0]).not.toBe(amounts[1])
    const newNote = 'has trip'
    rootStore.transactionsStore.childTransactions[0].businessId = businesses[0].id
    rootStore.transactionsStore.childTransactions[0].amount = amounts[0]
    rootStore.transactionsStore.childTransactions[1].businessId = businesses[1].id
    rootStore.transactionsStore.childTransactions[1].amount = amounts[1]
    rootStore.transactionsStore.childTransactions[1].note = newNote

    Api.prototype.patch = jest.fn().mockResolvedValueOnce([])
    TransactionApi.prototype.list = jest.fn().
      mockResolvedValueOnce({ items: amazonCardTransactions, openingBalance: 20 })

    await rootStore.transactionsStore.saveSplits()
    expect(Api.prototype.patch).toHaveBeenCalledWith(rootStore.transactionsStore.editItem.id, {
      'childTransactions':
        [
          {
            amount: amounts[0],
            businessId: businesses[0].id,
            categoryId: rootStore.transactionsStore.editItem.categoryId,
            id: expect.any(String),
            note: rootStore.transactionsStore.editItem.note
          },
          {
            amount: amounts[1],
            businessId: businesses[1].id,
            'categoryId': rootStore.transactionsStore.editItem.categoryId,
            id: expect.any(String),
            note: newNote
          }]
    })
    expect(rootStore.transactionsStore.childTransactions).toHaveLength(2)
  })
})

/** delete */
describe('delete', () => {
  it('should deletes row', async () => {
    const transactions = [...amazonCardTransactions].splice(0, 5)
    const openingBalance = 1000
    await rootStore.transactionsStore.setItems(transactions, openingBalance)
    const deleteApiMock = jest.fn().mockResolvedValueOnce()
    const { id } = rootStore.transactionsStore.items[1]
    rootStore.transactionsStore.items[1].source = c.sources.MANUAL
    Api.prototype.delete = deleteApiMock
    await rootStore.transactionsStore.setSelected(1)
    expect(rootStore.transactionsStore.items[0].balance).toBeGreaterThan(0)

    await rootStore.transactionsStore.delete()

    expect(deleteApiMock).toHaveBeenCalledTimes(1)
    expect(deleteApiMock).toHaveBeenCalledWith(id)
    expect(rootStore.transactionsStore.items).toHaveLength(transactions.length - 1)

    expect(rootStore.transactionsStore.items[0].balance).toBeGreaterThan(0)
    expect(rootStore.transactionsStore.items[1].balance).toBeGreaterThan(0)
  })
})

/** merge */
describe('merge', () => {
  beforeEach(() => jest.clearAllMocks())

  it('does nothing if items not of different type', async () => {
    const transactions = [...amazonCardTransactions].splice(0, 5)
    const openingBalance = 1000

    /** @type {psbf.Transaction} */
    const secondTransaction = transactionModel.clone(transactions[0])
    transactions.push(secondTransaction)
    const expectedNumberOfItems = transactions.length

    await rootStore.transactionsStore.setItems(transactions, openingBalance)

    await rootStore.transactionsStore.merge(secondTransaction.id)
    expect(expectedNumberOfItems).toBe(rootStore.transactionsStore.items.length)
  })
})
