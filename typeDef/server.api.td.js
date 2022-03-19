'use strict'

/**
 * @typedef {Object} InvalidRequestData
 * @property {boolean} result
 * @property {string} error
 */

/**
 @typedef {Object} TransactionRequest
 @property {string} accountId
 @property {string} postedDate
 @property {string} description
 @property {string} businessId
 @property {string} categoryId
 @property {string} amount
 @property {string} note
 @property {number} reconciled
 @property {number} scheduled
 */

/**
 * @typedef {Object} AxiosResponse
 * @template T
 * @property {T} data
 */

/** @module psbf.api.auth **/
/**
 * @typedef {Object} LoginResponse
 * @property {Object} [user]
 * @property {string} user.id
 * @property {string} user.nickname
 * @property {string} user.email
 * @property {string} [token]
 * @property {string} [error]
 */

/** @module psbf/api/budget **/
/**
 * @typedef {Object} ListResponse
 * @property {CategoryAmount[]} categoryMonthAmounts
 * @property {Object} monthTotals
 * @property {Number[]} monthTotals.amounts
 * @property {boolean} hasBudget
 */

/**
 * @typedef {Object} CategoryAmount
 * @property {string} categoryId
 * @property {string} categoryName
 * @property {MonthAmount[]} amounts
 */

/**
 * @typedef {Object} MonthAmount
 * @property {?number} [id]
 * @property {number} month
 * @property {number} amount
 * @property {?string} note
 */

/** @module psbf/api/application **/
/**
 * @typedef {Object} GetResponse
 * @property {number[]} years
 */

/** @module psbf/api/transactions **/
/**
 * @typedef {Object} UpdateMergeRequest
 * @property {string} mergeId
 *
 * @typedef {Object} UpdateMergeResponse
 * @property {psbf.Transaction} transaction
 * @property {psbf.Attachment[]} attachments
 * @property {string} deletedId
 */

/** @module psbf/api/reports **/
/**
 * @typedef {Object} YearTaxRequest
 * @property {string} businessId
 * @property {string} year
 */

/**
 * @typedef {Object} YearTaxExpenseItem
 * @property {string} categoryId
 * @property {string} categoryName
 * @property {number} amount
 */

/**
 * @typedef {Object} YearTaxResponse
 * @property {string} year
 * @property {string} businessId
 * @property {YearTaxExpenseItem[]} income
 * @property {YearTaxExpenseItem[]} expenses
 * @property {number} totalIncome
 * @property {number} totalExpenses
 * @property {number} profit
 * @property {number} mileage
 */

