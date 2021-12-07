'use strict'

import { Adapter } from '../mint-csv.js'
import DipRule from '../../../../shared/models/dipRule.js'
import { op } from '../../../../shared/models/condition.js'

const mintTransaction = {
  'Date': '1/14/2021',
  'Description': 'Costco Webster',
  'Original Description': 'KATY SEAFOOD MARKET GALVESTON US',
  'Amount': '45.80',
  'Transaction Type': 'debit',
  'Category': 'Business Services',
  'Account Name': 'Visa Costco',
  'Labels': '',
  'Notes': ''
}

const tenantId = 'tId-01'
let transaction
let mintCsvImporter
/**
 * importTransaction
 */
describe('importTransaction', () => {
  beforeEach(() => {
    transaction = Object.assign(mintTransaction)
    mintCsvImporter = new Adapter(tenantId, 'mint-csv.csv', 'mint-csv', 'all', false)
  })

  it ('sets category for Business Service and Rda', () => {
    const dipRule = new DipRule('rule01', tenantId)
    dipRule.adapterId = 'mint'
    dipRule.addCondition('Category', 'Business Services', op.INCL)
    dipRule.addCondition('Description', 'Costco', op.INCL)
    dipRule.addActon('categoryId', 'cat01')
    mintCsvImporter.rules = [dipRule]
    mintCsvImporter.adapterRules = [dipRule]

    const actual = mintCsvImporter.importTransaction(transaction)
    expect(actual.categoryId).toBe('cat01')
  })

  it ('does not set category for Business Service and Costco', () => {
    transaction.Description = 'Costco'

    const actual = mintCsvImporter.importTransaction(transaction)
    expect(actual.categoryId).toBeNull()
  })
})
