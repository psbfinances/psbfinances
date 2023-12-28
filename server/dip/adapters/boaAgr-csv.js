'use strict'

import { Importer } from '../importData.js'

/**
 * Importer for BoA accounts aggregator service.
 */
export class BoAgrCsvImporter extends Importer {
  constructor (tenantId, fileName, source, accountId, canSave) {
    super(tenantId, fileName, source, accountId, canSave)
    this.accountColumn = 'Account Name'
    this.categoryColumn = 'Category'
    this.source = 'boaAgr'
  }

  /**
   *
   * @override
   * @param {BoAgrTransaction} row
   * @param {psbf.Transaction} transaction
   */
  setTransactionValues (row, transaction) {
    transaction.postedDate = new Date(row.Date)
    transaction.amount = Math.round(Number(row.Amount.replace(',', '')) * 100)
    const description = row['Simple Description'].slice(0, 149)
    transaction.description = description
    transaction.originalDescription = description
    transaction.sourceOriginalDescription = row['Original Description'].slice(0, 149)
    transaction.externalUid = row.psbfUid
  }
}

export const Adapter = BoAgrCsvImporter

/**
 * @typedef {Object} BoAgrTransaction
 * @property {string} Date
 * @property {string} 'Simple Description'
 * @property {string} 'Original Description'
 * @property {string} Amount
 * @property {string} Category
 * @property {string} 'Account Name'
 * @property {string} psbfUid
 */
