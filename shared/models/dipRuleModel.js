'use strict'

import cuid from 'cuid'

const op = {
  EQ: '=',
  INCL: '$'
}

class Condition {
  field = ''
  condition = '='
  value = ''

  constructor (field, condition, value) {
    this.condition = condition
    this.field = field
    this.value = value
  }

  matched (data) {
    let result = false
    if (!transaction[this.field]) return false

    switch (this.condition) {
      case 'eg':
        result = transaction[this.field] === this.value
        break
      case '$':
        result = transaction[this.field].toString().toLowerCase().includes(this.value)
        break
    }

    return result
  }
}

const c1 = new Condition('Account Name', op.EQ, 'Visa Costco')
const matches = c1.matched(transaction)

export class TransactionRule {
  tenantId
  transactionId
  dipRuleId
}

export default class DipRuleModel {
  tenantId
  id
  adapterId
  /** @type {RuleFromType} */
  from = {}
  /** @type {Condition[]} */
  conditions = []
  /** @type {RuleToType} */
  to = {}
  toMap = new Map()
  disabled = false

  accountMatched (accountId) {
    return this.from.accountId && this.from.accountId === accountId
  }
  descriptionMatched (description) {
    return this.from.description && description.toLowerCase().includes(this.from.description)
  }
  amountMatched (amount) {
    return this.from.amount && this.from.amount === amount
  }
  /**
   *
   * @param {psbf.Transaction} transaction
   */
  transform (transaction) {
    if (!this.accountMatched(transaction.accountId)) return transaction

    let matched = this.accountMatched(transaction.accountId)
    matched &&= this.descriptionMatched(transaction.description)
    matched &&= this.amountMatched(transaction.amount)

    if (!matched) return transaction

    if (this.to.description) transaction.description = this.to.description
    if (this.to.type) transaction.businessId = this.to.type
    if (this.to.category) transaction.categoryId = this.to.category
    if (this.to.tripDistance) {
      // create trip
    }

    const transactionRule = {
      id: cuid(),
      tenantId: transaction.tenantId,
      transactionId: transaction.id,
      ruleId: this.id
    }
    return transaction
  }

  /**
   *
   * @param {psbf.Transaction} transaction
   */
  transform1 (transaction) {
    let matched = true
    this.conditions.forEach(x => matched &&= x.matched(transaction))
    if (!matched) return transaction

    this.toMap.forEach((key, value) => transaction[key] = value)
  }
}

/**
 * @typedef {Object} RuleFromType
 * @property {string} [accountId]
 * @property {string} [description]
 * @property {number} [amount]
 */
/**
 * @typedef {Object} RuleToType
 * @property {string} [description]
 * @property {string} [type]
 * @property {string} [category]
 * @property {number} [tripDistance]
 */
const field = {
  accountId: '',
  description: '',
  amount: '',
  categoryId: '',
  businessId: ''
}
Object.keys(field).forEach(x => field[x] = x)

const ALL = 'all'

const rule1 = new DipRuleModel()
rule1.id = 'id1'
rule1.tenantId = 't1'
rule1.adapterId = 'all'
rule1.from = {
  accountId: 'a1',
  description: 'check',
  amount: 325
}
rule1.conditions = [
  new Condition(field.accountId, op.EQ, ALL),
  new Condition(field.description, op.INCL, 'check'),
  new Condition(field.amount, op.EQ, 32500)
]
rule1.toMap.set(field.description, 'Melange Gallery')
rule1.toMap.set(field.businessId, 'salonId')
rule1.toMap.set(field.categoryId, 'suppliesCategoryId')
rule1.to = {
  description: 'Melange Gallery',
  type: 'b1',
  category: 'c1'
}
const transaction = {
  accountId: 'a1',
  description: 'CHECK 50',
  amount: 32500
}
