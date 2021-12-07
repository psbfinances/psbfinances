'use strict'

import httpMocks from 'node-mocks-http'
import { jest } from '@jest/globals'
import { initConfig } from '../../config/index.js'
import { TripDb, TransactionDb, DataChangeDb } from '../../db/index.js'
import { controller } from '../tripController.js'

let req
let res

/** delete */
describe('delete', () => {
  beforeAll(async () => {
    await initConfig()
  })
  beforeEach(() => {
    req = httpMocks.createRequest({
      method: 'DELETE',
      url: '/api/trips', user: {
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
    const getMock = jest.fn().mockResolvedValueOnce([])
    TripDb.prototype.get = getMock

    await controller.delete(req, res)
    expect(res.statusCode).toBe(404)
  })

  it('deletes transaction', async () => {
    const transactionUpdateMock = jest.fn().mockResolvedValueOnce()
    TransactionDb.prototype.update = transactionUpdateMock
    const getMock = jest.fn().mockResolvedValueOnce([{ id: 'id1', transactionId: 'tr1' }])
    const deleteMock = jest.fn().mockResolvedValueOnce()
    TripDb.prototype.get = getMock
    TripDb.prototype.delete = deleteMock
    const dataChangeInsertMock = jest.fn().mockResolvedValueOnce()
    DataChangeDb.prototype.insert = dataChangeInsertMock

    await controller.delete(req, res)
    expect(res.statusCode).toBe(200)
    expect(deleteMock).toHaveBeenCalledWith({ id: 'id1', tenantId: 't1' })
    expect(transactionUpdateMock).toHaveBeenCalledWith({ id: 'tr1', tenantId: 't1', tripId: null })
    expect(dataChangeInsertMock).toHaveBeenCalledTimes(2)
    // expect(dataChangeInsertMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
    //   'data': '{"oldTripId":"id1"}',
    //   'dataId': 'tr1',
    //   'entity': 'transactions',
    //   'operation': 'u',
    //   'tenantId': 't1',
    //   'userId': 'u1'
    // }))
    expect(dataChangeInsertMock).toHaveBeenLastCalledWith(expect.objectContaining({
      'data': '{"transactionId":"tr1"}',
      'dataId': 'id1',
      'entity': 'trips',
      'operation': 'd',
      'tenantId': 't1',
      'userId': 'u1'
    }))
  })

})
