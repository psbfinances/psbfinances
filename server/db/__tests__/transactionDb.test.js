'use strict'

import knex from 'knex'
import mockDb from 'mock-knex'
// noinspection ES6PreferShortImport
import { initConfig } from '../../config/index.js'
import TransactionDb from '../transactionDb'

const db = knex({
  client: 'mysql'
})
const tracker = mockDb.getTracker()

/** listByAccountDatesWithSearch */
describe.skip('listByAccountDatesWithSearch', () => {
  beforeAll(async () => {
    await initConfig()
  })
  /** @type {TransactionDb} */
  let transactionDb

  beforeEach(async () => {
    mockDb.mock(db)
    tracker.install()
    transactionDb = new TransactionDb('transactions')
  })

  afterEach(function () {
    mockDb.unmock(db)
    tracker.uninstall()
  })

  it('returns query without search criteria', async () => {
    const criteria = {
      tenantId: 'tenant01',
      accountId: 'account01',
      categoryId: undefined,
      dateFrom: '2020-01-01',
      dateTo: '2021-01-01',
      search: undefined,
      accountIds: undefined
    }

    tracker.on('query', function checkResult (query) {
      const expectedQuery = 'select `transactions`.`id`, `transactions`.`postedDate`, `transactions`.`accountId`,'+
        ' `transactions`.`categoryId`, `transactions`.`amount`, `transactions`.`businessId`,' +
        ' `transactions`.`description`, `transactions`.`originalDescription`,' +
        ' `transactions`.`sourceOriginalDescription`, `transactions`.`reconciled`, `transactions`.`deleted`,' +
        ' `transactions`.`source`, `transactions`.`scheduled`, `transactions`.`parentId`, `transactions`.`hasChildren`,' +
        ' `transactions`.`tripId`, `transactions`.`note`, `transactions`.`meta` ' +
        'from `transactions` ' +
        'where `tenantId` = ? and `accountId` = ? and `postedDate` >= ? and `postedDate` < ? ' +
        'order by `postedDate` desc, `originalDescription` asc'
      expect(query.sql).toBe(expectedQuery)
      query.response([])
    })


    await transactionDb.listByAccountDatesWithSearch(criteria)

  })

  it('returns query with search criteria', async () => {
    const criteria = {
      tenantId: 'tenant01',
      accountId: 'account01',
      categoryId: undefined,
      dateFrom: '2020-01-01',
      dateTo: '2021-01-01',
      search: 'web',
      accountIds: ['1', '2', '3']
    }

    tracker.on('query', function checkResult (query) {
      const expectedQuery = 'select `transactions`.`id`, `transactions`.`postedDate`, `transactions`.`accountId`,'+
        ' `transactions`.`categoryId`, `transactions`.`amount`, `transactions`.`businessId`,' +
        ' `transactions`.`description`, `transactions`.`originalDescription`,' +
        ' `transactions`.`sourceOriginalDescription`, `transactions`.`reconciled`, `transactions`.`deleted`,' +
        ' `transactions`.`source`, `transactions`.`scheduled`, `transactions`.`parentId`, `transactions`.`hasChildren`,' +
        ' `transactions`.`tripId`, `transactions`.`note`, `transactions`.`meta` ' +
        'from `transactions` ' +
        'where `tenantId` = ? and `accountId` = ? and `postedDate` >= ? and `postedDate` < ?' +
        ' and `accountId` in (?, ?, ?) and (`description` like ? or `note` like ?) ' +
        'order by `postedDate` desc, `originalDescription` asc'
      expect(query.sql).toBe(expectedQuery)
      query.response([])
    })

    await transactionDb.listByAccountDatesWithSearch(criteria)

  })
})
