'use strict'

import httpMocks from 'node-mocks-http'
import { beforeEach, expect, jest } from '@jest/globals'
import { initConfig } from '../../config/index.js'
import { BusinessDb, CategoryDb, DataChangeDb, Db, DuplicateCandidateDb, TransactionDb } from '../../db/index.js'
import { controller } from '../transactionController.js'
import { c } from '../../../shared/core/index.js'
import { transactionModel } from '../../../shared/models'

let req
let res

beforeAll(async () => {
  await initConfig()
})
beforeEach(() => jest.clearAllMocks())

const tenantId = 't1'
const userId = 'user1'

/** list */
describe('list', () => {
  beforeEach(() => {
    req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/transactions',
      user: { tenantId, id: 'u1' },
      body: {},
      query: { dateFrom: '2021-01-01', dateTo: '2021-02-01' },
      params: {}
    })
    res = httpMocks.createResponse()
  })

  it('returns no items if data not found', async () => {
    req.query.accountId = 'acc-1'
    TransactionDb.prototype.listByAccountDates = jest.fn().mockResolvedValueOnce([])
    DuplicateCandidateDb.prototype.listByTransactionIds = jest.fn().mockResolvedValueOnce([])

    await controller.list(req, res)

    const actual = res._getJSONData()

    expect(TransactionDb.prototype.listByAccountDates).toHaveBeenCalledWith({
      accountId: req.query.accountId,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      tenantId
    })
    expect(DuplicateCandidateDb.prototype.listByTransactionIds).toHaveBeenCalledTimes(0)
    expect(actual).toStrictEqual({
      items: [],
      openingBalance: 0
    })
  })
})

/** insert */
describe('insert', () => {
  beforeEach(() => {
    req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/transactions',
      user: { tenantId: 't1', id: 'u1' },
      body: {},
      query: {},
      params: {}
    })
    res = httpMocks.createResponse()
  })

  it('inserts valid transaction', async () => {
    TransactionDb.prototype.insert = jest.fn().mockResolvedValueOnce({ id: 1 })
    DataChangeDb.prototype.insert = jest.fn().mockResolvedValueOnce({})
    req.body = {
      accountId: 'acc-01',
      postedDate: '2021-04-01T12:45:15.778Z',
      description: 'Amazon',
      businessId: 'p',
      categoryId: null,
      amount: '20.00',
      note: ''
    }
    await controller.insert(req, res)

    const actual = res._getJSONData()
    expect(actual).toMatchObject({
      'tenantId': 't1',
      'accountId': 'acc-01',
      'description': 'Amazon',
      'categoryId': null,
      'businessId': 'p',
      'amount': 2000,
      'originalDescription': null,
      'sourceOriginalDescription': null,
      'frequency': null,
      'scheduled': 0,
      'completed': true,
      'reconciled': false,
      'deleted': false,
      'hasChildren': false,
      'note': '',
      'parentId': null,
      'externalUid': null,
      'dipSourceId': null,
      'source': 'm',
      'hasOpenTasks': false
    })
  })
})

/** delete */
describe('delete', () => {
  beforeAll(async () => {
    await initConfig()
  })
  beforeEach(() => {
    req = httpMocks.createRequest({
      method: 'DELETE',
      url: '/api/transactions', user: {
        tenantId: 't1',
        id: 'u1'
      },
      params: {
        id: 'id1'
      }
    })
    res = httpMocks.createResponse()
  })

  it('returns 404 if transaction is not found or another tenant', async () => {
    TransactionDb.prototype.get = jest.fn().mockResolvedValueOnce(null)

    await controller.delete(req, res)
    expect(res.statusCode).toBe(404)
  })

  it('returns 405 if transaction is not manual', async () => {
    TransactionDb.prototype.get = jest.fn().mockResolvedValueOnce({ id: 'id1', source: c.sources.IMPORT })

    await controller.delete(req, res)
    expect(res.statusCode).toBe(405)
  })

  it('deletes transaction', async () => {
    const getMock = jest.fn().mockResolvedValueOnce({ id: 'id1', source: c.sources.MANUAL })
    const deleteMock = jest.fn().mockResolvedValueOnce()
    TransactionDb.prototype.get = getMock
    TransactionDb.prototype.delete = deleteMock
    const dataChangeInsertMock = jest.fn().mockResolvedValueOnce()
    DataChangeDb.prototype.insert = dataChangeInsertMock

    await controller.delete(req, res)
    expect(res.statusCode).toBe(200)
    expect(deleteMock).toHaveBeenCalledWith({ id: 'id1', tenantId: 't1' })
    expect(dataChangeInsertMock).toHaveBeenCalledWith(expect.objectContaining({
      'data': '{"id":"id1","source":"m"}',
      'dataId': 'id1',
      'entity': 'transactions',
      'operation': 'd',
      'tenantId': 't1',
      'userId': 'u1'
    }))
  })
})

/** updateSplitTransaction */
describe('updateSplitTransaction', () => {
  const tenantId = 't1'
  const userId = 'u1'
  const transactionId = 'tr01'
  /** @type {Transaction} */
  let parentTransaction

  beforeEach(() => {
    parentTransaction = {
      id: transactionId,
      postedDate: new Date(),
      hasChildren: false,
      accountId: 'acc01',
      description: 't descr',
      categoryId: 'cat01',
      businessId: 'bus01',
      note: 't note',
      amount: 10000
    }
  })

  it.todo('get parent transaction returns nothing')

  it('saves new split', async () => {
    const childTransactions = [
      { id: 'new-ckpi9di7500003e670twu4j4t', businessId: 'p', categoryId: 'cat01', amount: 200.71, note: '' },
      { id: 'new-ckpi9di7500013e67k6bchkck', businessId: 'p', categoryId: 'cat02', amount: 100, note: '' }]

    TransactionDb.prototype.get = jest.fn().mockResolvedValueOnce(parentTransaction)
    Db.prototype.update = jest.fn().mockResolvedValueOnce([{}])
    TransactionDb.prototype.insert = jest.fn().mockResolvedValueOnce([{}])
    DataChangeDb.prototype.insert = jest.fn().mockResolvedValueOnce({})

    const actual = await controller.updateSplitTransaction(tenantId, userId, transactionId, childTransactions)

    expect(actual.children).toHaveLength(childTransactions.length)
    expect(Db.prototype.update).toHaveBeenCalledWith({
      businessId: null,
      categoryId: null,
      hasChildren: true,
      id: transactionId,
      tenantId
    })
    expect(TransactionDb.prototype.insert).toHaveBeenCalledTimes(2)
    expect(TransactionDb.prototype.insert).toHaveBeenNthCalledWith(1, expect.objectContaining(
      {
        accountId: parentTransaction.accountId,
        businessId: childTransactions[0].businessId,
        categoryId: childTransactions[0].categoryId,
        description: parentTransaction.description,
        amount: childTransactions[0].amount * 100,
        hasChildren: false,
        note: childTransactions[0].note,
        parentId: parentTransaction.id,
        source: parentTransaction.source
      }
    ))
    expect(TransactionDb.prototype.insert).toHaveBeenNthCalledWith(2, expect.objectContaining(
      {
        accountId: parentTransaction.accountId,
        businessId: childTransactions[1].businessId,
        categoryId: childTransactions[1].categoryId,
        description: parentTransaction.description,
        amount: childTransactions[1].amount * 100,
        hasChildren: false,
        note: childTransactions[1].note,
        parentId: parentTransaction.id,
        source: parentTransaction.source
      }
    ))
    expect(DataChangeDb.prototype.insert).toHaveBeenCalledTimes(3)
  })

  it('undo split', async () => {
    parentTransaction.hasChildren = true
    TransactionDb.prototype.get = jest.fn().mockResolvedValueOnce(parentTransaction)
    TransactionDb.prototype.deleteByParentId = jest.fn().mockResolvedValueOnce([{}])
    Db.prototype.update = jest.fn().mockResolvedValueOnce([{}])
    DataChangeDb.prototype.insert = jest.fn().mockResolvedValueOnce({})

    const childTransactions = []

    const actual = await controller.updateSplitTransaction(tenantId, userId, transactionId, childTransactions)

    expect(actual.children).toHaveLength(0)
    expect(Db.prototype.update).toHaveBeenCalledWith({
      hasChildren: false,
      id: parentTransaction.id,
      tenantId
    })
    expect(TransactionDb.prototype.deleteByParentId).toHaveBeenCalledTimes(1)
    expect(TransactionDb.prototype.deleteByParentId).toHaveBeenCalledWith(parentTransaction.id, tenantId)
    expect(DataChangeDb.prototype.insert).toHaveBeenCalledTimes(2)
  })

  it('updates existing split', async () => {
    parentTransaction.hasChildren = true
    const childTransactions = [
      { id: 'new-ckpi9di7500003e670twu4j4t', businessId: 'p', categoryId: 'cat01', amount: 200.71, note: 'note 1' },
      { id: 'new-ckpi9di7500013e67k6bchkck', businessId: 'p', categoryId: 'cat02', amount: 100, note: '' }]

    TransactionDb.prototype.get = jest.fn().mockResolvedValueOnce(parentTransaction)
    TransactionDb.prototype.listByParentId = jest.fn().
      mockResolvedValueOnce([{ id: childTransactions[1].id }, { id: 'delete-id' }])

    TransactionDb.prototype.deleteByParentId = jest.fn().mockResolvedValueOnce([{}])
    Db.prototype.update = jest.fn().mockResolvedValueOnce([{}])
    Db.prototype.delete = jest.fn().mockResolvedValueOnce([{}])
    Db.prototype.insert = jest.fn().mockResolvedValueOnce([{}])
    DataChangeDb.prototype.insert = jest.fn().mockResolvedValueOnce({})

    const actual = await controller.updateSplitTransaction(tenantId, userId, transactionId, childTransactions)

    expect(actual.children).toHaveLength(2)
    expect(Db.prototype.update).toHaveBeenCalledWith({
      id: childTransactions[1].id,
      tenantId,
      amount: childTransactions[1].amount * 100,
      businessId: childTransactions[1].businessId,
      categoryId: childTransactions[1].categoryId,
      note: childTransactions[1].note
    })
    expect(TransactionDb.prototype.delete).toHaveBeenCalledTimes(1)
    expect(TransactionDb.prototype.delete).toHaveBeenCalledWith({ id: 'delete-id', tenantId })

    expect(TransactionDb.prototype.insert).toHaveBeenCalledTimes(1)
    expect(TransactionDb.prototype.insert).toHaveBeenCalledWith(expect.objectContaining({
      tenantId,
      amount: childTransactions[0].amount * 100,
      businessId: childTransactions[0].businessId,
      categoryId: childTransactions[0].categoryId,
      note: childTransactions[0].note
    }))

    expect(DataChangeDb.prototype.insert).toHaveBeenCalledTimes(3)
  })
})

/** validate */
describe('validate', () => {
  const tenantId = 'tenant01'

  it('returns error if category does not belong to tenant', async () => {
    transactionModel.isValid = jest.fn().mockReturnValue({ valid: true, errors: {} })
    /** @type {typeof psbf.Transaction} */
    const transaction = { categoryId: 'cat1' }
    CategoryDb.prototype.get = jest.fn().mockResolvedValueOnce([])
    const actual = await controller.validate(tenantId, transaction)

    expect(actual.valid).toBeFalsy()
    expect(actual.errors.categoryId).not.toBeNull()
  })

  it('returns error if business does not belong to tenant', async () => {
    transactionModel.isValid = jest.fn().mockReturnValue({ valid: true, errors: {} })
    /** @type {typeof psbf.Transaction} */
    const transaction = { businessId: 'business1' }
    BusinessDb.prototype.get = jest.fn().mockResolvedValueOnce([])
    const actual = await controller.validate(tenantId, transaction)

    expect(actual.valid).toBeFalsy()
    expect(actual.errors.businessId).not.toBeNull()
  })

  it('returns error if business but category is personal', async () => {
    transactionModel.isValid = jest.fn().mockReturnValue({ valid: true, errors: {} })
    /** @type {typeof psbf.Transaction} */
    const transaction = { businessId: 'business1', categoryId: 'cat01' }
    CategoryDb.prototype.get = jest.fn().mockResolvedValueOnce([{ id: 'cat01', isPersonal: true }])
    BusinessDb.prototype.get = jest.fn().mockResolvedValueOnce([{ id: 'bus01' }])
    const actual = await controller.validate(tenantId, transaction)

    expect(actual.valid).toBeFalsy()
    expect(actual.errors.categoryId).not.toBeNull()
  })

  it('returns error if not a business but category is business', async () => {
    transactionModel.isValid = jest.fn().mockReturnValue({ valid: true, errors: {} })
    /** @type {typeof psbf.Transaction} */
    const transaction = { businessId: c.PERSONAL_TYPE_ID, categoryId: 'cat01' }
    CategoryDb.prototype.get = jest.fn().mockResolvedValueOnce([{ id: 'cat01', isPersonal: false }])
    BusinessDb.prototype.get = jest.fn().mockResolvedValueOnce([{ id: 'bus01' }])
    const actual = await controller.validate(tenantId, transaction)

    expect(actual.valid).toBeFalsy()
    expect(actual.errors.categoryId).not.toBeNull()
  })
})

/** processUpdate */
describe('processUpdate', () => {
  it('updates transaction', async () => {
    const transactionId = 'cktsso2s5000gl6yhbovb3os8'
    /** @type {typeof psbf.Transaction} */
    const requestBody = {
      categoryId: 'ckkfnvaqf00053e5itgq6ahb0',
      businessId: 'p',
      description: 'H-E-B #558 FRIENDSWOOD TX',
      note: '#task: business?',
      postedDate: '2021-09-15T05:00:00.000Z',
      amount: -32.5,
      tripId: null
    }
    TransactionDb.prototype.get = jest.fn().mockResolvedValue({
      id: 'cktsso2s5000gl6yhbovb3os8',
      postedDate: '2021-09-15',
      accountId: 'acc-03',
      categoryId: 'ckkfnvaqf00053e5itgq6ahb0',
      description: 'H-E-B #558 FRIENDSWOOD TX',
      amount: -3227,
      businessId: 'p',
      originalDescription: 'H-E-B #558 FRIENDSWOOD TX',
      sourceOriginalDescription: 'H-E-B #558 FRIENDSWOOD TX',
      scheduled: 1,
      reconciled: 1,
      deleted: 0,
      hasChildren: 0,
      parentId: null,
      note: '#task: business?',
      source: 'i',
      tripId: null,
      meta: null
    })
    controller.validate = jest.fn().mockResolvedValueOnce({ valid: true, errors: {} })
    controller.renameSimilarDescriptions = jest.fn().mockResolvedValueOnce()
    TransactionDb.prototype.update = jest.fn().mockResolvedValueOnce({})
    DataChangeDb.prototype.insert = jest.fn().mockResolvedValueOnce()

    await controller.processUpdate(tenantId, userId, transactionId, requestBody)

    expect(TransactionDb.prototype.update).toHaveBeenCalledWith({
      id: transactionId,
      tenantId,
      categoryId: 'ckkfnvaqf00053e5itgq6ahb0',
      businessId: 'p',
      description: 'H-E-B #558 FRIENDSWOOD TX',
      note: '#task: business?',
      postedDate: '2021-09-15',
      amount: -3250,
      tripId: null
    })
  })
})

