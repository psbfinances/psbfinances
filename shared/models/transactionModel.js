'use strict'

import isCurrency from 'validator/lib/isCurrency.js'
import isEmpty from 'validator/lib/isEmpty.js'
import isISO8601 from 'validator/lib/isISO8601.js'
import { c } from '../core/index.js'
import cuid from 'cuid'

const transactionModel = {
  /**
   * Creates a new transactions.
   * @param {string} accountId
   * @return {psbf.Transaction}
   */
  getNew: (accountId) => {
    return {
      id: null,
      postedDate: new Date(),
      accountId,
      description: '',
      categoryId: null,
      businessId: c.PERSONAL_TYPE_ID,
      amount: 0,
      originalDescription: null,
      sourceOriginalDescription: null,
      frequency: null,
      scheduled: true,
      completed: true,
      reconciled: 0,
      deleted: 0,
      hasChildren: 0,
      note: '',
      parentId: null,
      externalUid: null,
      dipSourceId: null,
      source: c.sources.MANUAL,
      hasOpenTasks: 0,
      duplicateCandidateId: null
    }
  },

  /**
   * Validates transaction data.
   * @param {psbf.BasicTransactionInfo} data
   * @return {{valid: boolean, errors: Object}}
   */
  isValid: data => {
    let { postedDate, description, businessId, categoryId, amount, note } = data
    let errors = {}
    if (amount === undefined) return { valid: true, errors }

    const date = postedDate instanceof Date ? postedDate.toISOString() : postedDate

    if (!Boolean(description) || isEmpty(description.trim()) || description.length >
      150) errors['description'] = 'Invalid description'
    if (!Boolean(postedDate) || !isISO8601(date)) errors['postedDate'] = 'Invalid date'
    if (!Boolean(amount.toString()) ||
      !isCurrency(amount.toString(), { negative_sign_before_digits: true, digits_after_decimal: [0, 1, 2] }))
      errors['amount'] = 'Invalid amount'
    if (Boolean(note) && note.length > 500) errors['note'] = 'Note is too long'
    if (Boolean(categoryId) && !cuid.isCuid(categoryId)) errors['categoryId'] = 'Invalid category'
    if (Boolean(businessId) && !(cuid.isCuid(businessId) || businessId === 'p')) errors['businessId'] = 'Invalid type'

    const valid = Object.keys(errors).length === 0

    return { valid, errors }
  },

  getNewId: () => `${c.NEW_ID_PREFIX}${cuid()}`,

  /**
   * @param {psbf.TransactionUI} transaction
   * @param {number} [amount]
   * @param {string} [id]
   * @param {string} [tenantId]
   * @param {psbf.Transaction} [childTransaction]
   * @return {psbf.TransactionUI}
   */
  getNewChild: (transaction, amount, id, tenantId, childTransaction) => {
    const result = transactionModel.clone(transaction)
    result.id = id || transactionModel.getNewId()
    if (tenantId) result.tenantId = tenantId
    if (transaction.accountId) result.accountId = transaction.accountId
    if (transaction.description) result.description = transaction.description
    result.postedDate = transaction.postedDate
    result.parentId = transaction.id
    result.source = transaction.source
    result.scheduled = transaction.scheduled
    result.reconciled = transaction.reconciled
    result.amount = isNaN(amount) ? transaction.amount : amount
    result.originalDescription = transaction.originalDescription
    result.sourceOriginalDescription = transaction.sourceOriginalDescription

    if (childTransaction) {
      result.categoryId = childTransaction.categoryId
      result.businessId = childTransaction.businessId
      result.note = childTransaction.note
    }
    transactionModel.clean(result)
    delete result.duplicateCandidateId
    return result
  },

  /**
   *
   * @param {psbf.Transaction|psbf.TransactionUI} transaction1
   * @param {psbf.Transaction|psbf.TransactionUI} transaction2
   * @return {boolean}
   */
  isEqual: (transaction1, transaction2) => {
    return Object.keys(transaction1).reduce((result, x) => {
      return result && transaction1[x] === transaction2[x]
    }, true)
  },

  /**
   * Creates transaction clone.
   * @param {psbf.TransactionUI} transaction
   * @return {psbf.TransactionUI}
   */
  clone: transaction => {
    const { postedDate, accountId, categoryId, businessId, amount, description, note } = transaction
    const result = transactionModel.getNew(accountId)
    result.postedDate = new Date(postedDate)
    result.postedDate.setMonth(result.postedDate.getMonth() + 1)
    result.categoryId = categoryId
    result.businessId = businessId
    result.amount = amount
    result.description = description
    result.note = note
    return result
  },

  /**
   * Creates a new manual transaction.
   * @param {psbf.BasicTransactionInfo} data
   * @return {psbf.Transaction}
   */
  getNewManual: (data) => {
    const { tenantId, postedDate, accountId, categoryId, businessId, amount, description, note, tripId } = data
    const defaultTransaction = transactionModel.getNew(accountId)
    const transactionData = {
      id: data.id || cuid(),
      // postedDate: new Date(postedDate),
      postedDate,
      categoryId,
      tenantId,
      businessId,
      amount,
      description,
      scheduled: 0,
      note,
      source: c.sources.MANUAL,
      tripId
    }
    // transactionData.postedDate.setHours(0, 0, 0, 0)
    delete defaultTransaction.duplicateCandidateId
    /** @type {psbf.Transaction} */
    const result = Object.assign(defaultTransaction, transactionData)
    transactionModel.clean(result)
    return result
  },

  /**
   * Cleans up transaction data.
   * @param {psbf.Transaction} transaction
   */
  clean: transaction => {
    /** @type {Transaction} */
    if (transaction.description) transaction.description = transaction.description.substr(0, 150).trim()
    if (transaction.note) transaction.note = transaction.note.substr(0, 500).trim()
  },

  /**
   * Calculates running balance and month divider.
   * @param {number} openingBalance
   * @param {psbf.Transaction[]} items
   */
  calcBalanceAndNewMonth: (openingBalance, items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return []

    /** @type {psbf.TransactionUI[]} */
    let transactions = []

    // TODO should I resort when data comes sorted from db?
    const sortedItems = items.sort((x, y) => {
      return new Date(x.postedDate) <= new Date(y.postedDate) ? 1 : -1
    })

    sortedItems.forEach(x => {
      if (x.parentId) {
        const hasParent = items.find(p => p.id === x.parentId)
        if (hasParent) return
        transactions.push(x)
      } else {
        transactions.push(x)
      }

      if (x.hasChildren) {
        const childTransactions = items.filter(y => y.parentId === x.id)
        transactions = [...transactions, ...childTransactions]
      }
    })

    let balance = openingBalance
    let date = new Date(transactions[0].postedDate)
    let monthYear = `${date.getFullYear()}-${date.getMonth()}`

    for (let i = transactions.length - 1; i >= 0; i--) {
      if (!transactions[i].parentId) {
        balance = transactionModel.calcBalance(balance, transactions[i].amount)
        transactions[i].balance = balance
      } else {
        transactions[i].balance = 0
      }

      transactions[0].isNewDate = true
      if (i === transactions.length - 1) {
        transactions[transactions.length - 1].isNewDate = true
      } else transactions[i + 1].isNewDate = transactions[i].postedDate !== transactions[i + 1].postedDate;

      date = new Date(transactions[i].postedDate)
      const transactionMonthYear = `${date.getFullYear()}-${date.getMonth()}`
      if (monthYear !== transactionMonthYear) {
        transactions[i].isNewMonth = true
        monthYear = transactionMonthYear
      } else {
        transactions[i].isNewMonth = false
      }
    }

    return transactions
  },

  /**
   * Gets transaction from some data, like POST request
   * @param {Object} data
   * @return {typeof psbf.Transaction}
   */
  getFromData (data) {
    let { categoryId, businessId, note, description, amount, postedDate, tripId } = data

    if (!Boolean(amount)) amount = 0
    amount = Math.round(amount * 100)

    return {
      categoryId,
      businessId,
      note,
      description,
      amount,
      postedDate,
      tripId
    }
  },

  /**
   *
   * @param {psbf.Transaction} transaction
   * @param {psbf.BasicTransactionInfo} newData
   * @return {psbf.BasicTransactionInfo|{reconciled: boolean, scheduled: boolean}}
   */
  getChanges (transaction, newData) {
    const { reconciled, scheduled } = newData
    if (reconciled !== undefined || scheduled !== undefined)
      return transactionModel.calcReconsiledAndScheduled(transaction, scheduled, reconciled)

    return transactionModel.getFromData(newData)
  },

  /**
   * Calculates reconciled and scheduled values based on the changes.
   * @param {psbf.Transaction} transaction
   * @param {boolean} [newScheduledValue]
   * @param {boolean} [newReconciledValue]
   * @return {{reconciled: boolean, scheduled: boolean}}
   */
  calcReconsiledAndScheduled (transaction, newScheduledValue, newReconciledValue) {
    let result = { scheduled: true, reconciled: newReconciledValue }
    if (transaction.source === c.sources.IMPORT) return result

    if (newScheduledValue === undefined) {
      if (newReconciledValue) result = { scheduled: true, reconciled: true }
      if (!newReconciledValue) result = { scheduled: transaction.scheduled, reconciled: false }
    }
    if (newReconciledValue === undefined) {
      if (newScheduledValue) result = { scheduled: true, reconciled: transaction.reconciled }
      if (!newScheduledValue) result = { scheduled: false, reconciled: false }
    }

    return result
  },

  calcBalance (balance, amount) {
    return Math.round((balance + amount) * 100) / 100
  }
}

export default transactionModel
