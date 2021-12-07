'use strict'

import { Importer } from '../importData.js'

export class MintCsvImporter extends Importer {
  constructor (tenantId, fileName, source, accountId, canSave) {
    super(tenantId, fileName, source, accountId, canSave)
    this.accountColumn = 'Account Name'
    this.categoryColumn = 'Category'
    this.source = 'mint'
  }

  /**
   *
   * @override
   * @param {MintTransaction} row
   * @param {psbf.Transaction} transaction
   */
  setTransactionValues (row, transaction) {
    const label = row.Labels !== '' ? `#${row.Labels}` : ''
    transaction.postedDate = new Date(row.Date)
    transaction.amount = Math.round(Number(row.Amount) * 100) *
      (row['Transaction Type'].toLowerCase() === 'debit' ? -1 : 1)
    transaction.description = row.Description
    transaction.originalDescription = row.Description
    transaction.sourceOriginalDescription = row['Original Description']
    transaction.note = `${row.Notes}${label}`
    transaction.externalUid = row.psbfUid
  }
}

export const Adapter = MintCsvImporter

/**
 * @typedef {Object} MintTransaction
 * @property {string} Date
 * @property {string} Description
 * @property {string} 'Original Description'
 * @property {string} Amount
 * @property {string} 'Transaction Type'
 * @property {string} Category
 * @property {string} 'Account Name'
 * @property {string} Labels
 * @property {string} Notes
 * @property {string} psbfUid
 */
