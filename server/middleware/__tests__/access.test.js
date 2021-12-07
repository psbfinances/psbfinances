'use strict'

import { jest } from '@jest/globals'
import httpMocks from 'node-mocks-http'
import access from '../access.js'
import { AccountDb, BusinessDb, CategoryDb } from '../../db/index.js'

/** authorize */
describe('authorize', () => {
  const user = {
    id: 'user1',
      tenantId: 'tenant1'
  }

  let res = httpMocks.createResponse()
  let next = jest.fn(() => {})

  beforeEach(() => {
    res = httpMocks.createResponse()
    next = jest.fn(() => {})
  })

  it('passes if access granted if params ok', async () => {
    const req = httpMocks.createRequest({
      user,
      params: {
        accountId: 'valid_tenant_account',
        businessId: 'valid_tenant_business',
        categoryId: 'valid_tenant_category'
      },
      body: {}
    })

    AccountDb.prototype.get = jest.fn().mockResolvedValueOnce([{ id: '1' }])
    CategoryDb.prototype.get = jest.fn().mockResolvedValueOnce([{ id: '1' }])
    BusinessDb.prototype.get = jest.fn().mockResolvedValueOnce([{ id: '1' }])

    await access.authorize(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
  })

  it('passes if personal transaction', async () => {
    const req = httpMocks.createRequest({
      user,
      params: {
        businessId: 'p'
      },
      body: {}
    })

    await access.authorize(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
  })

  it('passes if access granted if body ok', async () => {
    const req = httpMocks.createRequest({
      user,
      params: {
      },
      body: {
        accountId: 'valid_tenant_account',
        businessId: 'valid_tenant_business',
        categoryId: 'valid_tenant_category'
      }
    })

    AccountDb.prototype.get = jest.fn().mockResolvedValueOnce([{ id: '1' }])
    CategoryDb.prototype.get = jest.fn().mockResolvedValueOnce([{ id: '1' }])
    BusinessDb.prototype.get = jest.fn().mockResolvedValueOnce([{ id: '1' }])

    await access.authorize(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
  })

  it('fails if account is not of tenant', async () => {
    const req = httpMocks.createRequest({
      user,
      params: {
        accountId: 'not_tenant_account'
      },
      body: {}
    })

    AccountDb.prototype.get = jest.fn().mockResolvedValueOnce([])

    await access.authorize(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
  })

  it('fails if category is not of tenant', async () => {
    const req = httpMocks.createRequest({
      user,
      params: {
        categoryId: 'not_tenant_category'
      },
      body: {}
    })

    CategoryDb.prototype.get = jest.fn().mockResolvedValueOnce([])

    await access.authorize(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
  })

  it('fails if business is not of tenant', async () => {
    const req = httpMocks.createRequest({
      user,
      params: {
        businessId: 'not_tenant_business'
      },
      body: {}
    })

    BusinessDb.prototype.get = jest.fn().mockResolvedValueOnce([])

    await access.authorize(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
  })
})
