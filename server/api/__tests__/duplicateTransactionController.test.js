'use strict'

import { expect, jest } from '@jest/globals'
import { controller } from '../duplicateTransactionController.js'
import { initConfig } from '../../config'
import { DataChangeDb, DuplicateCandidateDb, DuplicateTransactionDb, TransactionDb } from '../../db/index.js'

const tenantId = 'tenantId-01'
const userId = 'userId-01'

beforeAll(async () => {
  await initConfig()
})

/** undo */
describe('processUndo', () => {
  it('returns empty object if duplicate id not found', async () => {
    DuplicateTransactionDb.prototype.get = jest.fn().mockResolvedValueOnce([])

    const actual = await controller.processUndo(100, tenantId, userId)
    expect(actual).toStrictEqual({})
  })

  it('returns transaction if undo is successful', async () => {
    const transactionData = '{"id":42,"tenantId":"tenantId-01","postedDate":"2021-06-29T05:00:00.000Z","accountId":"acc-03","categoryId":"ckkfnvaqf000j3e5iqfq4iqu0","description":"Pandora","amount":-6058,"businessId":"p","originalDescription":"Pandora","sourceOriginalDescription":"PANDORA ECOMMERCE 8444671333 MD","frequency":null,"scheduled":1,"completed":1,"reconciled":0,"deleted":0,"hasChildren":0,"note":"","parentId":null,"externalUid":"a9f1d67ffd46e36d26c191e0f4cbb1f3588c1399","dipSourceId":null,"hasOpenTasks":0,"importProcessId":"ckr5aj1rp00017acu64dw2yuf","hasDuplicates":null,"source":"i","tripId":null}'
    const duplicateTransactionRow = {
      id: 42,
      tenantId,
      parentTransactionId: 'ckqgigajp000av2cug02deskk',
      externalUid: 'a9f1d67ffd46e36d26c191e0f4cbb1f3588c1399',
      transactionData
    }
    DuplicateTransactionDb.prototype.get = jest.fn().mockResolvedValueOnce([duplicateTransactionRow])
    DuplicateTransactionDb.prototype.delete = jest.fn().mockResolvedValueOnce()
    TransactionDb.prototype.insert = jest.fn().mockResolvedValueOnce({})
    DataChangeDb.prototype.insert = jest.fn().mockResolvedValue()

    const actual = await controller.processUndo(42, tenantId, userId)
    const expected = JSON.parse(transactionData)
    expected.postedDate = expected.postedDate.substr(0, 10)
    expect(actual).toStrictEqual(expected)
    expect(DuplicateTransactionDb.prototype.delete).toHaveBeenCalledWith({ id: 42, tenantId })
    expect(TransactionDb.prototype.insert).toHaveBeenCalledWith(expected)
    expect(DataChangeDb.prototype.insert).toHaveBeenCalledTimes(2)
  })
})

/** processListByParentId */
describe('processListByParentId', () => {
  it('returns 2 duplicates', async () => {
    const transactionData = [
      '[{"id":"ckr5aj4cr001l7acu8a338p0o","tenantId":"tenantId-01","postedDate":"2021-06-29T05:00:00.000Z","accountId":"acc-03","categoryId":"ckkfnvaqf000j3e5iqfq4iqu0","description":"Pandora","amount":-6058,"businessId":"p","originalDescription":"Pandora","sourceOriginalDescription":"PANDORA ECOMMERCE 8444671333 MD","frequency":null,"scheduled":1,"completed":1,"reconciled":0,"deleted":0,"hasChildren":0,"note":"","parentId":null,"externalUid":"a9f1d67ffd46e36d26c191e0f4cbb1f3588c1399","dipSourceId":null,"hasOpenTasks":0,"importProcessId":"ckr5aj1rp00017acu64dw2yuf","hasDuplicates":null,"source":"i","tripId":null}]',
      '[{"id":"ckr5aj4cr001l7acu8a338p02","tenantId":"tenantId-01","postedDate":"2021-06-29T05:00:00.000Z","accountId":"acc-03","categoryId":"ckkfnvaqf000j3e5iqfq4iqu0","description":"Pandora","amount":-6058,"businessId":"p","originalDescription":"Pandora","sourceOriginalDescription":"PANDORA ECOMMERCE 8444671333 MD","frequency":null,"scheduled":1,"completed":1,"reconciled":0,"deleted":0,"hasChildren":0,"note":"","parentId":null,"externalUid":"a9f1d67ffd46e36d26c191e0f4cbb1f3588c1399","dipSourceId":null,"hasOpenTasks":0,"importProcessId":"ckr5aj1rp00017acu64dw2yuf","hasDuplicates":null,"source":"i","tripId":null}]']
    const duplicateTransactionRows = [
      {
        id: 42,
        tenantId,
        parentTransactionId: 'parentTransactionId-01',
        externalUid: 'a9f1d67ffd46e36d26c191e0f4cbb1f3588c1399',
        transactionData: [transactionData[0]]
      },
      {
        id: 44,
        tenantId,
        parentTransactionId: 'parentTransactionId-01',
        externalUid: 'a9f1d67ffd46e36d26c191e0f4cbb1f3588c1399',
        transactionData: [transactionData[1]]
      }
    ]
    DuplicateTransactionDb.prototype.listByParentTransactionId = jest.fn().
      mockResolvedValueOnce(duplicateTransactionRows)

    const actual = await controller.processListByParentId('id', tenantId)
    expect(actual).toHaveLength(2)
    expect(actual).toStrictEqual([
      {
        'amount': -60.58,
        'description': 'Pandora',
        'id': 42,
        'postedDate': '2021-06-29T05:00:00.000Z'
      },
      {
        'amount': -60.58,
        'description': 'Pandora',
        'id': 44,
        'postedDate': '2021-06-29T05:00:00.000Z'
      }
    ])
  })
})

/** updateResolve */
describe('updateResolve', () => {
  it('does nothing if no duplicate candidate', async () => {
    DuplicateCandidateDb.prototype.listByTransaction = jest.fn().mockResolvedValueOnce([])

    const actual = await controller.updateResolve('transactionId1', userId, tenantId)
    expect(actual).toHaveLength(0)
  })

  it('does nothing if transaction was resolved already - not a duplicate', async () => {
    DuplicateCandidateDb.prototype.listByTransaction = jest.fn().mockResolvedValueOnce([
      {
        id: 1,
        transactionId: 'transactionId1',
        duplicateId: 'transactionId2',
        importId: 'importId1',
        resolved: 1
      },
      {
        id: 2,
        transactionId: 'transactionId2',
        duplicateId: 'transactionId1',
        importId: 'importId1',
        resolved: 1
      }])

    const actual = await controller.updateResolve('transactionId1', userId, tenantId)
    expect(actual).toHaveLength(0)
  })

  it('resolves 2 transactions - not a duplicate', async () => {
    DuplicateCandidateDb.prototype.listByTransaction = jest.fn().mockResolvedValueOnce([
      {
        id: 1,
        transactionId: 'transactionId1',
        duplicateId: 'transactionId2',
        importId: 'importId1',
        resolved: 0
      },
      {
        id: 2,
        transactionId: 'transactionId2',
        duplicateId: 'transactionId1',
        importId: 'importId1',
        resolved: 0
      }])
    DuplicateCandidateDb.prototype.update = jest.fn().mockResolvedValueOnce()
    DataChangeDb.prototype.insert = jest.fn().mockResolvedValue()

    const actual = await controller.updateResolve('transactionId1', userId, tenantId)
    expect(actual).toStrictEqual(['transactionId1', 'transactionId2'])
    expect(DuplicateCandidateDb.prototype.update).toHaveBeenCalledTimes(2)
    expect(DataChangeDb.prototype.insert).toHaveBeenCalledTimes(2)
  })

})
