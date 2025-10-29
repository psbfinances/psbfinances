// TODO: add tenantId

/**
 * @namespace psbf
 */

/**
 * @typedef {Object} Tenant
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {?string} [tenantId]
 * @property {string} email
 * @property {?string} [password]
 * @property {string} nickname
 * @property {string} fullName
 * @property {boolean} hasAccess
 */

/**
 * @typedef {Object} Business
 * @property {string} id
 * @property {string} tenantId
 * @property {'LLC'|'S-Corp'|'DBA'} type
 * @property {string} nickname
 * @property {string} fullName
 * @property {string} ownerId
 * @property {User} owner
 */

/**
 * @typedef {Object} Bank
 * @property {number} id
 * @property {string} shortName
 * @property {string} fullName
 */

/**
 * @typedef {Object} Car
 * @property {string} id
 * @property {string} tenantId
 * @property {string} description
 * @property {boolean} isInUse
 */
/**
 * @typedef {Object} FinancialAccount
 * @property {string} id
 * @property {string} tenantId
 * @property {string} shortName
 * @property {string} fullName
 * @property {'Credit Card'|'Banking'|'Saving'|'Cash'|'Investment'} type
 * @property {string} [bankId]
 * @property {Bank} bank
 * @property {number} [businessId]
 * @property {Business} [business]
 * @property {boolean} closed=false
 * @property {boolean} visible=true
 * @property {boolean} deleted=false
 * @property {boolean} isDefault
 * @property {number} openingBalance
 * @property {number} balance
 * @property {?string} format
 * @property {?string} note
 * @property {?Object} meta
 * @property {?boolean} meta.scheduledEnabled
 * @property {?Date} createdAt
 * @property {number} currentBalance
 * @property {number} unreconciledCount
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {boolean} isPrivate=true
 */

/**
 * @typedef {Object} TransactionDescription
 * @property {string} id
 * @property {string} tenantId
 * @property {string} description
 */

/**
 * @typedef {Object} BaseTransaction
 * @property {string} accountId
 * @property {Date} postedDate
 * @property {string} description
 *
 */

/**
 * @typedef {Object} RecurringTransaction
 * @property {string} id
 * @property {string} tenantId
 * @property {JSON} rule
 * @property {number} amount
 */

/**
 * @typedef {Object} RecurringTransactionInstance
 * @property {string} tenantId
 * @property {string} recurringTransactionId
 * @property {string} transactionId
 */

/**
 * @typedef {Object} OriginalTransaction
 * @property {string} id
 * @property {string} source
 * @property {Date} dateAdded
 * @property {Object} data
 */

/**
 * @typedef {Object} Import
 * @property {string} id
 * @property {string} tenantId
 * @property {string} processId
 * @property {string} step - start, end, ...
 * @property {string} source - mint-csv, ...
 * @property {string} fileName
 * @property {Object} counts
 * @property {Object} stats
 * @property {Date} stepDateTime
 * @property {Object} fileInfo
 */

/**
 * @typedef {Object} DataChange
 * @property {number} [id]
 * @property {string} tenantId
 * @property {string} entity
 * @property {string} dataId
 * @property {Date} entryDateTime
 * @property {'i'|'u'|'d'} operation
 * @property {string} userId
 * @property {string} importProcessId
 * @property {Object} data
 *
 */

/**
 * @typedef {Object} DuplicateTransaction
 * @property {number} id
 * @property {string} tenantId
 * @property {string} transactionId
 * @property {string} parentTransactionId
 * @property {Transaction} transactionData
 * @property {string} externalUid
 */

/**
 * @typedef {Object} Recurrence
 * @property {string} id
 * @property {string} tenantId
 * @property {string} accountId
 * @property {Object} rule
 */

/**
 * @typedef {Object} RecurringTransactionInstance
 * @property {string} tenantId
 * @property {string} recurrenceId
 * @property {string} transactionId
 */

/**
 * @typedef {Object} Budget
 * @property {number} id
 * @property {string} tenantId
 * @property {number} year
 * @property {number} monthNo
 * @property {string} categoryId
 * @property {number} amount
 * @property {string} comment
 */

/**
 * @typedef {Object} DuplicateCandidate
 * @property {number} [id]
 * @property {string} transactionId
 * @property {string} duplicateId
 * @property {string} importId
 * @property {boolean} resolved
 */

/**
 * @typedef {Object} Car
 * @property {string} id
 * @property {string} tenantId
 * @property {string} description
 * @property {boolean} isInUse
 */

/**
 * @typedef {Object} Trip
 * @property {string} id
 * @property {string} [tenantId]
 * @property {string} description
 * @property {Date} startDate
 * @property {Date} endDate
 * @property {number} distance
 * @property {string} [transactionId]
 */

/**
 * @typedef {Object} SelectOption
 * @property {string} value
 * @property {string} label
 * @property {number} [isPersonal]
 */

export default {}
