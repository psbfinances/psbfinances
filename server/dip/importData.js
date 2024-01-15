'use strict'

import hash from 'object-hash'
import fs from 'fs'
import cuid from 'cuid'
import path from 'path'
import { parse } from 'csv-parse/sync'
// noinspection JSFileReferences
import { ratio, partial_ratio } from 'fuzzball/dist/esm/fuzzball.esm.min.js'
import {
  AccountDb,
  BankDb,
  BusinessDb,
  CarDb,
  CategoryDb,
  DataChangeDb,
  DuplicateCandidateDb,
  DuplicateTransactionDb,
  ImportDb,
  ImportRuleDb,
  ImportRuleTransactionDb,
  TransactionDb, TripDb,
  UserDb
} from '../db/index.js'
import { accountModel, categoryModel, transactionModel, tripModel } from '../../shared/models/index.js'
import { initConfig } from '../config/index.js'
import ImportLog from './importLog.js'
import { getLogger } from '../core/index.js'
import { c } from '../../shared/core/index.js'
import DipRule from '../../shared/models/dipRule.js'
import { op } from '@psbfinances/shared/models/condition.js'

const logger = getLogger(import.meta.url)

export const injectUid = (row, i) => {
  const psbfUid = i === 0 ? 'psbfUid' : `${hash(row)}`
  return `${row},${psbfUid}`
}

export const importStep = {
  UPLOADED: 'uploaded',
  ENRICH: 'enrich',
  START: 'start',
  END: 'end',
  ARCHIVE_FILE: 'archFile',
  DELETE_ENRICHED_FILE: 'delEnrichFile',
  DONE: 'done'
}

/**
 * Add unique id for each data row in the source file.
 * @export
 * @param {string} fileName
 */
export const enrich = fileName => {
  if (fileName.includes('-enr')) return

  const data = fs.readFileSync(fileName).toString().split('\n')
  if (data[0].includes('psbfUid')) return

  const result = data.filter(x => x.length > 0).map((x, i) => injectUid(x, i))

  const newFileName = fileName.replace('.csv', '-enr.csv')
  fs.writeFileSync(newFileName, result.join('\n'), 'utf-8')
}

/***
 * @class
 * @export
 * @property {string} tenantId
 * @property {'mint-csv'|'citi-csv'|'appleCard-csv'|'boa-agr-csv'} source
 * @property {string} fileName
 * @property {string} accountId
 * @property {boolean} canSave
 * @property {string} processId
 * @property {AccountDb} accountDb
 * @property {BusinessDb} businessDb
 * @property {CarDb} carDb
 * @property {UserDb} userDb
 * @property {BankDb} bankDb
 * @property {TransactionDb} transactionDb
 * @property {TripDb} tripDb
 * @property {ImportDb} importDb
 * @property {DataChangeDb} dataChangeDb
 * @property {CategoryDb} categoryDb
 * @property {ImportRuleDb} importRuleDb
 * @property {DuplicateTransactionDb} duplicateTransactionDb
 * @property {DuplicateCandidateDb} duplicateCandidateDb
 * @property {ImportLog} importLog
 * @property {Date} runDate
 * @property {psbf.Transaction[]} newTransactions
 * @property {Map} tempOriginalDataArchive
 * @property {Set} sameFileDuplicates
 * @property {ImportFileInfo} fileInfo
 * @property {DipRule[]} rules
 * @property {psbf.ImportRuleTransaction[]} transactionRules
 * @property {boolean} hasCars
 * @property {string} defaultCarId
 * @property {string} accountColumn
 * @property {string} categoryColumn
 */
export class Importer {
  /** @type {DipRule[]} */ rules = []
  /** @type {DipRule[]} */ allAdaptersRules = []
  /** @type {DipRule[]} */ adapterRules = []

  /**
   * @description #NO_NEED_UT
   * @param {string} tenantId
   * @param {string|ImportFileInfo} fileInfo
   * @param {string} source
   * @param {string} accountId
   * @param {boolean} canSave
   */
  constructor (tenantId, fileInfo, source, accountId = 'all', canSave = false) {
    this.tenantId = tenantId
    this.fileName = typeof fileInfo === 'string' ? fileInfo : fileInfo.internalName
    this.source = source
    this.accountId = accountId || 'all'
    this.canSave = canSave || false
    this.processId = cuid()
    this.importLog = new ImportLog()
    this.runDate = new Date()
    /** @type {psbf.Transaction[]} */ this.newTransactions = []
    this.tempOriginalDataArchive = new Map()
    this.sameFileDuplicates = new Set()
    if (typeof fileInfo !== 'string') this.fileInfo = fileInfo
    this.rules = []
    /** @type {psbf.ImportRuleTransaction[]} */
    this.transactionRules = []
  }

  /**
   *
   * @return {Promise<boolean>}
   */
  async isFirstTimeImport () {
    const accounts = await this.accountDb.list(this.tenantId)
    return accounts.length === 0
  }

  /**
   *
   * @param {string} name - new account name
   * @return {Promise<{rule: DipRule, account: FinancialAccount}>}
   */
  async createAccount (name) {
    const account = accountModel.getNew()
    account.id = cuid()
    account.tenantId = this.tenantId
    account.fullName = name.substring(0, 100)
    account.shortName = name.substring(0, 25)
    account.createdAt = this.runDate
    const aName = name.toLowerCase()
    if (aName.toLowerCase() === 'cash') account.type = 'cash'
    if (aName.toLowerCase().includes('card')) account.type = 'CC'
    if (aName.toLowerCase().includes('visa')) account.type = 'CC'
    if (aName.toLowerCase().includes('mastercard')) account.type = 'CC'
    this.importLog.addNewAccount(account.id, name)
    if (this.canSave) await this.accountDb.insert(account)

    const rule = new DipRule(cuid(), this.tenantId)
    rule.adapterId = this.source.replace('-csv', '')
    rule.addCondition(this.accountColumn, name, op.INCL)
    rule.addActon('accountId', account.id)
    this.importLog.addNewRule()
    if (this.canSave) await this.importRuleDb.insert(rule)

    logger.info('createAccount', { name, account, rule })

    return { account, rule }
  }

  /**
   * Creates new category.
   * @param {string} name - new category name.
   * @return {Promise<{rule: DipRule, category: psbf.Category}>}
   */
  async createCategory (name) {
    const category = categoryModel.getNew()
    category.id = cuid()
    category.tenantId = this.tenantId
    category.name = name.substring(0, 100)
    if (name.toLowerCase().includes('income')) category.type = 'i'
    if (name.toLowerCase().includes('deposit')) category.type = 'i'
    if (name.toLowerCase().includes('transfer')) category.type = 't'
    this.importLog.addNewCategory(category.id, name)
    if (this.canSave) await this.categoryDb.insert(category)

    const rule = new DipRule(cuid(), this.tenantId)
    rule.adapterId = this.source.replace('-csv', '')
    rule.addCondition(this.categoryColumn, name)
    rule.addActon('categoryId', category.id)
    this.importLog.addNewRule(rule.id)
    if (this.canSave) await this.importRuleDb.insert(rule)

    return { category, rule }
  }

  /**
   *
   * @param rows
   * @return {Promise<DipRule[]>}
   */
  async runFirstTimeImport (rows) {
    this.importLog.counts.allTransactions = rows.length

    /** @type {Map<string, FinancialAccount>} */
    const accounts = new Map()
    /** @type {Map<string, psbf.Category>} */
    const categories = new Map()
    /** @type {DipRule[]} */
    const rules = []

    for (const row of rows) {
      const accountName = row[this.accountColumn]
      if (!accounts.has(accountName)) {
        const { account, rule } = await this.createAccount(accountName)
        accounts.set(accountName, account)
        rules.push(rule)
      }
      const categoryName = row[this.categoryColumn]
      if (!categories.has(categoryName)) {
        const { category, rule } = await this.createCategory(categoryName)
        categories.set(categoryName, category)
        rules.push(rule)
      }
    }
    return rules
  }

  /**
   * Imports file.
   * @return {Promise<void>}
   */
  async run () {
    logger.info('run', { step: 'start', processId: this.processId, fileName: this.fileName })
    await initConfig()
    this.initDb()
    await this.getRules()
    await this.checkTenantHasCars()

    await this.logStep('start')
    const data = fs.readFileSync(this.fileName)
    const rows = parse(data, { columns: true, skip_empty_lines: true })
    if (await this.isFirstTimeImport()) {
      const rules = await this.runFirstTimeImport(rows)
      this.adapterRules = [...rules, ...this.adapterRules]
    }
    this.importLog.counts.allTransactions = rows.length

    for (const data of rows) {
      await this.importRow(data)
    }

    await this.detectDuplicates()
    await this.saveTransactionRules()

    const { counts, stats, newData } = this.importLog
    await this.logStep('end', counts, stats, newData)
    logger.info('run:end', { processId: this.processId, fileName: this.fileName, counts, stats, newData })
  }

  /* istanbul ignore next */
  static async getAdapter (formatId) {
    const adapterModule = await import(`./adapters/${formatId}-csv.js`)
    return adapterModule.Adapter
  }

  /* istanbul ignore next */
  initDb () {
    this.accountDb = new AccountDb()
    this.categoryDb = new CategoryDb()
    this.businessDb = new BusinessDb()
    this.userDb = new UserDb()
    this.bankDb = new BankDb()
    this.carDb = new CarDb()
    this.transactionDb = new TransactionDb()
    this.tripDb = new TripDb()
    this.importDb = new ImportDb()
    this.dataChangeDb = new DataChangeDb()
    this.duplicateTransactionDb = new DuplicateTransactionDb()
    this.importRuleDb = new ImportRuleDb()
    this.duplicateCandidateDb = new DuplicateCandidateDb()
  }

  /**
   * Logs import step.
   * @description #NO_NEED_UT
   * @param {string} step
   * @param {Object} [counts]
   * @param {Object} [stats]
   * @param {Object} [newData]
   * @return {Promise<void>}
   */
  async logStep (step, counts, stats, newData) {
    logger.info(step, { processId: this.processId })
    if (!this.canSave) return

    const fileImport = {
      id: cuid(),
      tenantId: this.tenantId,
      processId: this.processId,
      step,
      source: this.source,
      fileName: path.parse(this.fileName).base,
      stepDateTime: new Date()
    }
    if (step === importStep.START && this.fileInfo) fileImport.fileInfo = this.fileInfo
    if (counts) fileImport.counts = counts
    if (stats) fileImport.stats = stats
    if (newData) fileImport.newData = newData

    await this.importDb.insert(fileImport)
  }

  async checkTenantHasCars () {
    const cars = await this.carDb.list(this.tenantId)
    this.hasCars = cars.length > 0
    this.defaultCarId = this.hasCars ? cars[0].id : null
  }

  /* istanbul ignore next */
  /**
   * Inserts transaction into db.
   * @async
   * @param {psbf.Transaction} transaction
   * @return {Promise<void>}
   */
  async insertTransaction (transaction) {
    if (!this.canSave) return
    logger.debug('insertTransaction', { transaction })

    await this.transactionDb.insert(transaction)
    await this.logDataChanges(transaction)
  }

  /* istanbul ignore next */
  /**
   * @param {psbf.Transaction} transaction
   * @return {Promise<void>}
   */
  async logDataChanges (transaction) {
    const { tenantId, id, ...data } = transaction
    /** @typedef {DataChange} */
    const dataChange = {
      tenantId: transaction.tenantId,
      entity: 'transactions',
      dataId: transaction.id,
      entryDateTime: this.runDate,
      operation: 'i',
      userId: 'dip',
      importProcessId: this.processId,
      data
    }
    await this.dataChangeDb.insert(dataChange)
  }

  /**
   * Creates new transaction.
   * @description #NO_NEED_UT
   * @return {psbf.Transaction}
   */
  getNewTransaction () {
    const result = transactionModel.getNew(this.accountId)
    result.id = cuid()
    result.tenantId = this.tenantId
    result.source = 'i'
    return result
  }

  /**
   * Sets transaction values from raw data.
   * @param {Object} row
   * @param {psbf.Transaction} transaction
   * @description this method is overridden in specific data adapter.
   */
  setTransactionValues (row, transaction) {

  }

  /**
   * Gets data transformation rules.
   * @return {Promise<void>}
   */
  async getRules () {
    const importRuleDb = new ImportRuleDb()
    const rules = await importRuleDb.list(this.tenantId)

    this.rules = rules.map(x => (DipRule.parse(x)))
    this.allAdaptersRules = this.rules.filter(x => x.adapterId === c.dipAdapters.all.id)
    this.adapterRules = this.rules.filter(x => x.adapterId === this.source)
  }

  /**
   * Transforms transaction by applying rules.
   * @param {Object} row
   * @param {psbf.Transaction} transaction
   * @return {psbf.Transaction}
   */
  applyRules (row, transaction) {
    let result = this.applyAdapterRules(this.adapterRules, row, transaction)
    result = this.applyAdapterRules(this.allAdaptersRules, row, result)
    return result
  }

  applyAdapterRules (rules, row, transaction) {
    let result = { ...transaction }
    rules.forEach(x => {
      const transformResult = x.transform(result, row)
      if (transformResult.modified) this.transactionRules.push({ transactionId: transaction.id, ruleId: x.id })
      result = transformResult.transaction
    })
    return result
  }

  /**
   * Returns account id for the existing account or creates a new account and returns its id.
   * @param {psbf.Transaction} transaction
   * @param {Object} row
   * @return {Promise<string>}
   */
  async getAccountIdForExistingOrNew (transaction, row) {
    if (transaction.accountId !== c.dipAdapters.all.id) return Promise.resolve(transaction.accountId)

    const { account, rule } = await this.createAccount(row[this.accountColumn])
    this.adapterRules.push(rule)

    return account.id
  }

  async importRow (data) {
    const originalTransactionForArchive = { id: data.psbfUid, source: this.source, dateAdded: this.runDate, data }
    if (!this.sameFileDuplicates.has(originalTransactionForArchive.data.psbfUid)) {
      const existing = await this.isExisting(originalTransactionForArchive.data.psbfUid)
      if (existing) return
    }
    this.tempOriginalDataArchive.set(originalTransactionForArchive.id, originalTransactionForArchive)
    this.sameFileDuplicates.add(originalTransactionForArchive.id)

    const transaction = this.importTransaction(data)
    transaction.accountId = await this.getAccountIdForExistingOrNew(transaction, data)
    this.validateTransaction(transaction)
    transaction.importProcessId = this.processId
    const tripId = await this.insertTrip(transaction)
    if (tripId) transaction.tripId = tripId

    await this.insertTransaction(transaction)
    this.importLog.setAllTransactionsDateRange(transaction.postedDate)
    this.importLog.setNewTransactionsDateRange(transaction.postedDate)
    this.importLog.countNewTransaction()

    this.newTransactions.push(transaction)
  }

  async insertTrip (transaction) {
    if (!this.hasCars) return Promise.resolve(null)
    if (!transaction.tripDistance) return Promise.resolve(null)

    try {
      const distance = Number.parseInt(transaction.tripDistance)

      const trip = tripModel.getNew(this.defaultCarId, transaction.description, transaction.postedDate, distance)
      trip.transactionId = transaction.id
      trip.tenantId = this.tenantId
      transaction.tripId = trip.id
      const tripDb = new TripDb()
      await tripDb.insert(trip)
      delete transaction.tripDistance

      const dataChange = {
        tenantId: transaction.tenantId,
        entity: 'trips',
        dataId: trip.id,
        entryDateTime: this.runDate,
        operation: 'i',
        userId: 'dip',
        importProcessId: this.processId,
        data: trip
      }
      await this.dataChangeDb.insert(dataChange)

      return trip.id
    } catch (e) {
      logger.error('insertTrip', { trip, distance: transaction.tripDistance, e })
      return null
    }
  }

  async detectDuplicates () {
    for (const transaction of this.newTransactions) {
      const { id, postedDate, amount, accountId } = transaction
      const dbTransactions = await this.transactionDb.listDuplicateCandidates(this.tenantId, id, accountId, postedDate,
        amount)
      if (dbTransactions.length === 0) continue

      const fuzz1 = partial_ratio(transaction.sourceOriginalDescription, dbTransactions[0].sourceOriginalDescription)
      const fuzz2 = ratio(transaction.originalDescription, dbTransactions[0].originalDescription)
      if ((fuzz1 + fuzz2) / 2 <= 55) continue

      /** @type {DuplicateCandidate} */
      const duplicateCandidate = {
        transactionId: transaction.id,
        duplicateId: dbTransactions[0].id,
        importId: this.processId,
        resolved: false
      }
      this.importLog.countDuplicateCandidates()
      if (this.canSave) await this.duplicateCandidateDb.insert(duplicateCandidate)

      this.logDuplicateForDebug(transaction, dbTransactions[0])
    }
  }

  /**
   * Logs duplicate transactions data for debugging.
   * @param {psbf.Transaction} newTransaction
   * @param {psbf.Transaction} existingTransaction
   */
  logDuplicateForDebug (newTransaction, existingTransaction) {
    const data = {
      postedDate1: newTransaction.postedDate,
      postedDate2: existingTransaction.postedDate,
      description1: newTransaction.description,
      description2: existingTransaction.description,
      oDescription1: newTransaction.originalDescription,
      oDescription2: existingTransaction.originalDescription,
      soDescription1: newTransaction.sourceOriginalDescription,
      soDescription2: existingTransaction.sourceOriginalDescription,
      fuzz: ratio(newTransaction.sourceOriginalDescription, existingTransaction.sourceOriginalDescription),
      note: existingTransaction.note
    }
    logger.debug('detectDuplicates', data)
  }

  /**
   *
   * @param {Object} row
   * @return {psbf.Transaction}
   */
  importTransaction (row) {
    let transaction = this.getNewTransaction(row)
    delete transaction.duplicateCandidateId
    this.setTransactionValues(row, transaction)
    if (this.accountId !== 'all') transaction.accountId = this.accountId
    transaction = this.applyRules(row, transaction)
    return transaction
  }

  /**
   * Checks whether transaction was imported already.
   * @param {string} uid
   * @return {Promise<boolean>}
   */
  async isExisting (uid) {
    /** @type {string[]} */
    let result = await this.transactionDb.getByExternalUid(uid, this.tenantId)
    if (result.length > 0) return true

    result = await this.duplicateTransactionDb.getByExternalUid(uid, this.tenantId)
    return result.length > 0
  }

  /**
   *
   * @param {psbf.Transaction} transaction
   */
  validateTransaction (transaction) {
    if (!transaction.categoryId) this.importLog.countCategories()
    if (!transaction.accountId) this.importLog.countMissingAccounts()
  }

  /**
   * Saves log of the rules that were applied to transactions.
   * @return {Promise<void>}
   */
  async saveTransactionRules () {
    if (this.transactionRules.length === 0) return Promise.resolve()

    const importRuleTransactionDb = new ImportRuleTransactionDb()
    for (let transactionRule of this.transactionRules) {
      try {
        transactionRule.tenantId = this.tenantId
        transactionRule.importId = this.processId
        transactionRule.createdAt = this.runDate

        await importRuleTransactionDb.insert(transactionRule)
      } catch (e) {
        logger.error('saveTransactionRules', { transactionRule, e })
      }
    }
  }
}
