'use strict'

import { Importer } from '../importData.js'

export class AppleCardCsvImporter extends Importer {
  constructor (tenantId, fileName, source, accountId, canSave) {
    super(tenantId, fileName, source, accountId, canSave)
    this.source = 'appleCard'
  }

  /**
   *
   * @param {AppleCardTransaction} row
   * @param {psbf.Transaction} transaction
   */
  setTransactionValues (row, transaction) {
    transaction.postedDate = new Date(row['Transaction Date'])
    transaction.amount = -1 * Number(row['Amount (USD)']) * 100
    transaction.description = row.Merchant
    transaction.originalDescription = row.Description
    transaction.externalUid = row.psbfUid
  }
}

/**
 * @typedef {Object} AppleCardTransaction
 * @property {string} 'Transaction Date'
 * @property {string} 'Clearing Date'
 * @property {string} Description
 * @property {string} Merchant
 * @property {string} Category
 * @property {'Purchase', 'Payment'} Type
 * @property {number} 'Amount (USD)'
 * @property {string} 'Purchased By'
 * @property {string} psbfUid
 */

export const Adapter = AppleCardCsvImporter
