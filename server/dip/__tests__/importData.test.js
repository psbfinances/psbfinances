'use strict'

import { beforeEach, expect, jest } from '@jest/globals'
import { enrich, Importer, importStep } from '../importData.js'
import { MintCsvImporter } from '../adapters/mint-csv.js'
import { AppleCardCsvImporter } from '../adapters/appleCard-csv.js'
import {
  Db,
  DuplicateCandidateDb,
  TransactionDb,
  ImportDb,
  ImportRuleDb,
  CarDb,
  TripDb,
  DataChangeDb, AccountDb
} from '../../db/index.js'
import { initConfig } from '../../config/index.js'
import DipRule from '../../../shared/models/dipRule.js'
import { op } from '../../../shared/models/condition.js'
import cuid from 'cuid'
import { BoAgrCsvImporter } from '../adapters/boaAgr-csv.js'


/**
 * Run
 */
describe.skip('run', () => {
  // const tenantId = 'tenant-01'
  const tenantId = 'ckkfm160400003e5iimcnpt66'
  const fileName = '../server/dip/__tests__/ExportData'
  /** @type {Importer} */
  let importer

  beforeEach(() => {
    process.env.NODE_ENV = 'dev'
    importer = new Importer(tenantId, 'ExportData', 'boaAgr-csv', 'all', false)
  })

  afterEach(() => {
    delete process.env.NODE_ENV
  })

  it('injects uid ', () => {
    // noinspection SpellCheckingInspection
    enrich(`${fileName}.csv`)
    expect(true).toBeTruthy()
  })

  it('imports boa-agr-csv file', async () => {
    const fileFullName = `${fileName}-enr.csv`
    const canSave = false
    const fileImporter = new BoAgrCsvImporter(tenantId, fileFullName, 'boaAgr', 'all', canSave)
    await fileImporter.run()
    expect(true).toBeTruthy()
  }, 800000)

  it('imports mint-csv file', async () => {
    const fileFullName = `${fileName}-enr.csv`
    const canSave = false
    const fileImporter = new MintCsvImporter(tenantId, fileFullName, 'mint-csv', 'all', canSave)
    await fileImporter.run()
    expect(true).toBeTruthy()
  }, 800000)

  it('imports appleCard-csv file', async () => {
    // noinspection SpellCheckingInspection
    const fileFullName = `${fileName}-enr.csv`
    const canSave = false

    const fileImporter = new AppleCardCsvImporter(tenantId, fileFullName, 'appleCard-csv', 'acc-03', canSave)
    await fileImporter.run()
    expect(true).toBeTruthy()
  }, 800000)

  it('converts mappings to rules', async () => {
    const fileFullName = `${fileName}-enr.csv`
    const canSave = false

    const fileImporter = new MintCsvImporter(tenantId, fileFullName, 'mint-csv', 'all', canSave)
    await initConfig()
    fileImporter.initDb()
    const importRuleDb = new ImportRuleDb()
    for (const mapping of fileImporter.mapping) {
      const rule = new DipRule(cuid(), tenantId)
      rule.adapterId = 'mint'
      Object.keys(mapping.from).forEach(x => rule.addCondition(x, mapping.from[x].replace('$$', '')))
      Object.keys(mapping.to).filter(x => x !== 'hasOpenTasks').forEach(x => rule.addActon(x, mapping.to[x]))
      await importRuleDb.insert(rule)
    }
    expect(true).toBeTruthy()
  }, 800000)
})

/** importTransaction */
describe('importTransaction', () => {
  let mintCsvImporter
  const tenantId = 'tenant-01'
  const mintTransaction = {
    'Date': '9/03/2021',
    'Description': 'Orig Name Service',
    'Original Description': 'ORIG CO NAME:MERCHANT SERVICE CO',
    'Amount': '115.00',
    'Transaction Type': 'credit',
    'Category': 'Business Income',
    'Account Name': 'CHK LLC',
    'Labels': '',
    'Notes': '',
    'psbfUid': '1f4cf811535954d7885fd1f5ab5f567d39a06e34'
  }
  const expectedTransaction = {
    accountId: 'acc-06',
    amount: 11500,
    businessId: 'bus-02',
    categoryId: 'cat-131',
    completed: true,
    deleted: false,
    description: 'Orig Name Service',
    dipSourceId: null,
    externalUid: '1f4cf811535954d7885fd1f5ab5f567d39a06e34',
    frequency: null,
    hasChildren: false,
    hasOpenTasks: false,
    note: '',
    originalDescription: 'Orig Name Service',
    parentId: null,
    postedDate: new Date('2021-09-03T05:00:00.000Z'),
    reconciled: false,
    scheduled: true,
    source: 'i',
    sourceOriginalDescription: 'ORIG CO NAME:MERCHANT SERVICE CO',
    tenantId
  }

  beforeEach(() => {
    mintCsvImporter = new MintCsvImporter(tenantId, 'mint-csv-2021-20210501', 'mint-csv', 'all', false)
  })

  it('imports transaction', async () => {
    Importer.prototype.isExisting = jest.fn().mockResolvedValueOnce(Promise.resolve(false))
    const dipRule = new DipRule('rule01', tenantId)
    dipRule.adapterId = 'mint'
    dipRule.addCondition('Account Name', 'CHK LLC', op.INCL)
    dipRule.addCondition('Category', 'Business Income')
    dipRule.addActon('accountId', 'acc-06')
    dipRule.addActon('categoryId', 'cat-131')
    dipRule.addActon('businessId', 'bus-02')

    mintCsvImporter.rules = [dipRule]
    mintCsvImporter.adapterRules = [dipRule]

    const actual = await mintCsvImporter.importTransaction(mintTransaction)
    expect(actual).toMatchObject(expectedTransaction)
  })

  it('imports row', async () => {
    Importer.prototype.insertTransaction = jest.fn().mockResolvedValueOnce(null)
    Importer.prototype.isExisting = jest.fn().mockResolvedValueOnce(Promise.resolve(false))
    Db.prototype.insert = jest.fn().mockResolvedValueOnce(null)
    const dipRule = new DipRule('rule01', tenantId)
    dipRule.adapterId = 'mint'
    dipRule.addCondition('Account Name', 'CHK LLC', op.INCL)
    dipRule.addCondition('Category', 'Business Income')
    dipRule.addActon('accountId', 'acc-06')
    dipRule.addActon('categoryId', 'cat-131')
    dipRule.addActon('businessId', 'bus-02')

    mintCsvImporter.rules = [dipRule]
    mintCsvImporter.adapterRules = [dipRule]

    await mintCsvImporter.importRow(mintTransaction)

    expect(mintCsvImporter.newTransactions).toHaveLength(1)
    expect(mintCsvImporter.newTransactions[0]).toMatchObject(expectedTransaction)

    expect(mintCsvImporter.importLog).toMatchObject({
      counts: {
        allTransactions: 0,
        duplicateCandidates: 0,
        newTransactions: 1,
        msBusinessServices: 0,
        missingAccount: 0,
        missingCategory: 0
      },
      stats: {
        dateFrom: new Date('2021-09-03T05:00:00.000Z'),
        dateTo: new Date('2021-09-03T05:00:00.000Z'),
        newTransactionsDateFrom: new Date('2021-09-03T05:00:00.000Z'),
        newTransactionsDateTo: new Date('2021-09-03T05:00:00.000Z')
      }
    })
  })

  it('ignores duplicate data', async () => {
    Importer.prototype.isExisting = jest.fn().mockResolvedValueOnce(Promise.resolve(true))
    await mintCsvImporter.importRow(mintTransaction)

    expect(mintCsvImporter.newTransactions).toHaveLength(0)
  })

  it('imports transaction and creates new account', async () => {
    const mintTransaction = {
      'Date': '9/03/2021',
      'Description': 'Orig Name Service',
      'Original Description': 'ORIG CO NAME:MERCHANT SERVICE CO',
      'Amount': '115.00',
      'Transaction Type': 'credit',
      'Category': 'Business Income',
      'Account Name': 'New bank account',
      'Labels': '',
      'Notes': '',
      'psbfUid': '1f4cf811535954d7885fd1f5ab5f567d39a06e34'
    }

    Importer.prototype.insertTransaction = jest.fn().mockResolvedValueOnce(null)
    Db.prototype.insert = jest.fn().mockResolvedValueOnce(null)
    Importer.prototype.isExisting = jest.fn().mockResolvedValueOnce(Promise.resolve(false))
    AccountDb.prototype.insert = jest.fn().mockResolvedValueOnce()
    ImportRuleDb.prototype.insert = jest.fn().mockResolvedValueOnce()
    expect(mintCsvImporter.rules).toHaveLength(0)

    await mintCsvImporter.importRow(mintTransaction)

    const expectedNewTransaction = mintCsvImporter.newTransactions[0]
    expect(mintCsvImporter.adapterRules).toHaveLength(1)
    expect(mintCsvImporter.adapterRules[0].conditions[0].field === 'Account Name')
    expect(mintCsvImporter.adapterRules[0].conditions[0].value === mintTransaction['Account Name'])
    expect(expectedNewTransaction.accountId).not.toBe('all')
    expect(expectedNewTransaction.accountId).toBe(mintCsvImporter.adapterRules[0].actions.get('accountId'))
  })
})

/** logStep */
describe('logStep', () => {
  const tenantId = 'tenant-01'
  const fileName = 'mint-csv-2021-20210621'
  const source = 'mint-csv'
  /** @type {Importer} */
  let importer

  beforeAll(async () => {
    await initConfig()
  })

  beforeEach(() => {
    importer = new Importer(tenantId, 'mint-csv-2021-20210621', 'mint-csv', 'all', true)
    importer.initDb()
  })

  it('logs start', async () => {
    ImportDb.prototype.insert = jest.fn().mockResolvedValueOnce()
    const counts = {
      allTransactions: 0,
      duplicateCandidates: 0,
      newTransactions: 1,
      msBusinessServices: 0,
      missingAccount: 0,
      missingCategory: 0
    }
    const stats = {
      dateFrom: new Date('2021-09-03T05:00:00.000Z'),
      dateTo: new Date('2021-09-03T05:00:00.000Z'),
      newTransactionsDateFrom: new Date('2021-09-03T05:00:00.000Z'),
      newTransactionsDateTo: new Date('2021-09-03T05:00:00.000Z')
    }
    importer.logStep(importStep.START, counts, stats)
    expect(ImportDb.prototype.insert).toHaveBeenCalledTimes(1)
    expect(ImportDb.prototype.insert).toHaveBeenCalledWith({
      step: importStep.START,
      id: expect.any(String),
      processId: expect.any(String),
      stepDateTime: expect.any(Date),
      fileName,
      source,
      tenantId,
      counts,
      stats
    })
  })
})

/** detectDuplicates */
describe('detectDuplicates', () => {
  /** @type {Importer} */
  let importer
  const tenantId = 'ten-01'

  beforeAll(async () => {
    await initConfig()
  })

  beforeEach(() => {
    importer = new Importer(tenantId, 'mint-csv-2021-20210621', 'mint-csv', 'all', false)
    importer.initDb()
  })

  it('finds no duplicate if not present', async () => {
    importer.canSave = true
    importer.newTransactions = transactions
    TransactionDb.prototype.listDuplicateCandidates = jest.fn().mockResolvedValue([])
    Db.prototype.insert = jest.fn().mockResolvedValueOnce(null)

    await importer.detectDuplicates()
    expect(Db.prototype.insert).toHaveBeenCalledTimes(0)
  })

  it('detects duplicate', async () => {
    importer.newTransactions = transactions
    importer.canSave = true
    const possibleDuplicate = {
      id: 'id-01',
      sourceOriginalDescription: 'AMZN Mktp US',
      originalDescription: 'Amazon'
    }
    TransactionDb.prototype.listDuplicateCandidates = jest.fn().
      mockResolvedValueOnce([possibleDuplicate]).
      mockResolvedValueOnce([])
    DuplicateCandidateDb.prototype.insert = jest.fn().mockResolvedValueOnce(null)

    await importer.detectDuplicates()
    expect(DuplicateCandidateDb.prototype.insert).toHaveBeenCalledTimes(1)
  })
})

/** getRules */
describe('getRules', () => {
  /** @type {Importer} */
  let importer
  const tenantId = 'tenant-01'

  beforeAll(async () => {
    await initConfig()
  })

  beforeEach(() => {
    importer = new Importer(tenantId, 'mint-csv-2021-20210621', 'mint-csv', 'all', false)
    importer.initDb()
  })

  it('set empty rule list if no rules defined', async () => {
    ImportRuleDb.prototype.list = jest.fn().mockResolvedValueOnce([])
    await importer.getRules()

    expect(importer.rules).toHaveLength(0)
  })

  it('set import rules', async () => {
    ImportRuleDb.prototype.list = jest.fn().mockResolvedValueOnce(rules)

    await importer.getRules()
    expect(importer.rules).toHaveLength(2)
    expect([...importer.rules[0].actions.keys()]).toStrictEqual(['description', 'businessId', 'categoryId'])
    expect([...importer.rules[0].actions.values()]).
      toStrictEqual(['Salon Gallery', 'bus-02', 'cat-131'])
    expect([...importer.rules[1].actions.keys()]).
      toStrictEqual(['description', 'businessId', 'categoryId', 'tripDistance'])
    expect([...importer.rules[1].actions.values()]).
      toStrictEqual(['Rda Pro Mart', 'bus-02', 'cat-04', '15'])
    expect(importer.rules).toMatchObject([
      {
        id: 'rule-01',
        adapterId: 'all',
        disabled: false,
        conditions: [
          { condition: '=', field: 'accountId', value: 'acc-06' },
          { condition: '$', field: 'description', value: 'check' },
          { condition: '=', field: 'amount', value: 325 }
        ],
        actions: expect.any(Map)
      },
      {
        id: 'rule-02',
        adapterId: 'all',
        disabled: false,
        conditions: [
          { condition: '=', field: 'accountId', value: 'acc-03' },
          { condition: '$', field: 'description', value: 'rda' }
        ],
        actions: expect.any(Map)
      }
    ])
  })
})

/** applyRules */
describe('applyRules', () => {
  it('transforms final transaction description, category, business and trip distance', async () => {
    const tenantId = 'tenant-01'
    await initConfig()
    const importer = new Importer(tenantId, 'mint-csv-2021-20210621', 'mint-csv', 'all', false)
    importer.initDb()
    ImportRuleDb.prototype.list = jest.fn().mockResolvedValueOnce(rules)

    const transaction = {
      'id': 'trans-01',
      'postedDate': '2021-07-15T05:00:00.000Z',
      'accountId': 'acc-03',
      'categoryId': '',
      'amount': -192.89,
      'businessId': '',
      'description': 'RDA PRO MART',
      'originalDescription': 'Rda Pro Mart',
      'sourceOriginalDescription': 'RDA PRO MART',
      'reconciled': 0,
      'deleted': 0,
      'source': 'i',
      'scheduled': 1,
      'parentId': null,
      'hasChildren': 0,
      'tripId': null,
      'note': '',
      'meta': { 'hasAttachment': true }
    }
    await importer.getRules()
    const actual = importer.applyRules({}, transaction)
    expect(actual.description).toBe('Rda Pro Mart')
    expect(actual.businessId).toBe('bus-02')
    expect(actual.categoryId).toBe('cat-04')
    expect(importer.transactionRules).toHaveLength(1)
    expect(importer.transactionRules[0].ruleId).toBe(rules[1].id)
  })

  it('transforms final transaction description, category, business for check', async () => {
    const tenantId = 'tenant-01'
    await initConfig()
    const importer = new Importer(tenantId, 'mint-csv-2021-20210621', 'mint-csv', 'all', false)
    importer.initDb()
    ImportRuleDb.prototype.list = jest.fn().mockResolvedValueOnce(rules)

    const transaction = {
      'id': 'trans-01',
      'postedDate': '2021-07-15T05:00:00.000Z',
      'accountId': 'acc-06',
      'categoryId': '',
      'amount': -32500,
      'businessId': '',
      'description': 'CHECK 191',
      'originalDescription': 'CHECK',
      'sourceOriginalDescription': 'CHECK 191',
      'reconciled': 0,
      'deleted': 0,
      'source': 'i',
      'scheduled': 1,
      'parentId': null,
      'hasChildren': 0,
      'tripId': null,
      'note': '',
      'meta': { 'hasAttachment': true }
    }
    await importer.getRules()
    const actual = importer.applyRules({}, transaction)
    expect(actual.description).toBe('Salon Gallery')
    expect(actual.businessId).toBe('bus-02')
    expect(actual.categoryId).toBe('cat-131')
    expect(importer.transactionRules).toHaveLength(1)
    expect(importer.transactionRules[0].ruleId).toBe(rules[0].id)
  })
})

/** insertTrip */
describe('insertTrip', () => {
  /** @type {Importer} */
  let importer
  const tenantId = 'tenant-01'

  beforeAll(async () => {
    await initConfig()
  })

  beforeEach(() => {
    importer = new Importer(tenantId, 'mint-csv-2021-20210621', 'mint-csv', 'all', false)
    importer.initDb()
  })

  it('ignores transaction without trip', async () => {
    importer.hasCars = true
    importer.defaultCarId = 'car-01'
    const transaction = { ...transactions[0] }
    const actual = await importer.insertTrip(transaction)
    expect(actual).toBeNull()
  })

  it('ignores transaction if tenant has no cars', async () => {
    importer.hasCars = false
    const transaction = { ...transactions[0] }
    transaction.tripDistance = 20
    CarDb.prototype.list = jest.fn().mockResolvedValueOnce([])
    const actual = await importer.insertTrip(transaction)
    expect(actual).toBeNull()
  })

  it('inserts trip', async () => {
    const transaction = { ...transactions[0] }
    const car = { id: 'car-01', description: 'Jeep', isInUse: 1 }
    importer.hasCars = true
    importer.defaultCarId = car.id
    transaction.tripDistance = '20'
    TripDb.prototype.insert = jest.fn().mockResolvedValueOnce({})
    DataChangeDb.prototype.insert = jest.fn().mockResolvedValueOnce({})
    const actual = await importer.insertTrip(transaction)
    expect(actual).not.toBeNull()
    expect(transaction.tripDistance).toBeUndefined()
    expect(TripDb.prototype.insert).toHaveBeenCalledTimes(1)
    expect(TripDb.prototype.insert).toHaveBeenCalledWith({
      carId: car.id,
      transactionId: transaction.id,
      tenantId,
      description: transaction.description,
      distance: 20,
      id: expect.any(String),
      startDate: transaction.postedDate,
      endDate: transaction.postedDate
    })
    expect(DataChangeDb.prototype.insert).toHaveBeenCalledTimes(1)
  })
})

// noinspection SpellCheckingInspection
const transactions = [
  {
    'id': 'trans-01',
    'postedDate': '2021-05-16T05:00:00.000Z',
    'accountId': 'acc-02',
    'description': 'Amazon',
    'categoryId': 'cat-01',
    'businessId': 'p',
    'amount': -5783,
    'originalDescription': 'Amazon',
    'sourceOriginalDescription': 'AMZN Mktp US*CJ999999',
    'frequency': null,
    'scheduled': true,
    'completed': true,
    'reconciled': false,
    'deleted': false,
    'hasChildren': false,
    'note': '',
    'parentId': null,
    'externalUid': 'e3acd3e0cb2a8a08055c6ac1a61c7cac9ce98b0d',
    'dipSourceId': null,
    'source': 'i',
    'hasOpenTasks': false,
    'tenantId': 'tenant-01',
    'importProcessId': 'proc-01'
  },
  {
    'id': 'trans-02',
    'postedDate': '2021-05-16T05:00:00.000Z',
    'accountId': 'acc-02',
    'description': 'Amazon',
    'categoryId': 'cat-01',
    'businessId': 'p',
    'amount': -691,
    'originalDescription': 'Amazon',
    'sourceOriginalDescription': 'Amazon.com',
    'frequency': null,
    'scheduled': true,
    'completed': true,
    'reconciled': false,
    'deleted': false,
    'hasChildren': false,
    'note': '',
    'parentId': null,
    'externalUid': '2d846530604e65c028cb45a8017c4299b8a33466',
    'dipSourceId': null,
    'source': 'i',
    'hasOpenTasks': false,
    'tenantId': 'tenant-01',
    'importProcessId': 'proc-01'
  }
]

const rules = [
  {
    'id': 'rule-01',
    'adapterId': 'all',
    'conditions': '[{"field": "accountId", "value": "acc-06", "condition": "="}, {"field": "description", "value": "check", "condition": "$"}, {"field": "amount", "value": "325", "condition": "="}]',
    'actions': '[["description", "Salon Gallery"], ["businessId", "bus-02"], ["categoryId", "cat-131"]]',
    'disabled': 0
  },
  {
    'id': 'rule-02',
    'adapterId': 'all',
    'conditions': '[{"field": "accountId", "value": "acc-03", "condition": "="}, {"field": "description", "value": "rda", "condition": "$"}]',
    'actions': '[["description", "Rda Pro Mart"], ["businessId", "bus-02"], ["categoryId", "cat-04"], ["tripDistance", "15"]]',
    'disabled': 0
  }]
