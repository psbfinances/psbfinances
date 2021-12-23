'use strict'


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
