'use strict'

import Condition, { op } from './condition.js'
import { c } from '../core/index.js'

export const field = {
  accountId: '',
  description: '',
  amount: '',
  categoryId: '',
  businessId: ''
}
Object.keys(field).forEach(x => field[x] = x)

const ALL = 'all'

/**
 * DIP transformation rule.
 */
export default class DipRule {
  /** @type {string} */ id
  /** @type {?string} */ tenantId
  adapterId = ALL
  /** @type {Condition[]} */  conditions = []
  /** @type {Map<string, string>} */  actions = new Map()
  disabled = false
  createdAt = new Date()

  constructor (id, tenantId) {
    this.id = id
    this.tenantId = tenantId
    this.disabled = false
    this.createdAt = new Date()
  }

  addCondition (field, value, condition = op.EQ) {
    if (!Boolean(value)) return
    const fieldValue = value.trim()
    if (fieldValue === '' || fieldValue === c.selectId.NONE || fieldValue === c.selectId.ALL) return

    this.conditions.push(new Condition(field, fieldValue, field === 'description' ? op.INCL : condition))
  }

  addActon (field, value) {
    if (!Boolean(value)) return
    const fieldValue = value.trim()
    if (fieldValue === '' || fieldValue === c.selectId.NONE) return

    this.actions.set(field, fieldValue)
  }

  validate () {
    // TODO
    return {}
  }

  /**
   * Prepares object to store in db.
   * @return {{actions: string, disabled: boolean, id: string, conditions: string}}
   */
  toDb () {
    const conditions = JSON.stringify(this.conditions)
    const actions = JSON.stringify([...this.actions.entries()])
    const { id, disabled, tenantId, adapterId } = this
    return { id, disabled, tenantId, adapterId, conditions, actions, createdAt: new Date() }
  }

  /**
   *
   * @param dbData
   * @return {DipRule}
   */
  static fromDb (dbData) {
    const rule = dbData
    const result = new DipRule(rule.id)
    result.conditions = JSON.parse(rule.conditions)
    result.actions = new Map(JSON.parse(rule.actions))
    result.disabled = Boolean(rule.disabled)
    return result
  }

  static fromData (data) {
    let result = new DipRule(data.id)
    result = Object.assign(result, data)
    result.actions = new Map(data.actions)
    return result
  }

  /**
   * Applies action - transforms transaction.
   * @param {psbf.Transaction} transaction
   * @param {Object|psbf.Transaction} [rawTransaction]
   * @return {{modified: boolean, transaction: psbf.Transaction}}
   */
  transform (transaction, rawTransaction) {
    let source = this.adapterId === 'all' ? transaction : rawTransaction
    let matched = true
    this.conditions.forEach(x => matched &&= x.matched(source))
    if (!matched) return { modified: false, transaction }

    /** @type {psbf.Transaction} */
    let result = Object.assign({}, transaction)
    this.actions.forEach((value, key) => {
      result[key] = value
      // if (key === 'tripDistance') {}
      // else result[key] = value
    })

    return { modified: true, transaction: result }
  }

  /**
   *
   * @param {string} value
   * @return {DipRule}
   */
  static parse (value) {
    const rule = typeof value === 'string' ? JSON.parse(value) : value
    const result = new DipRule(rule.id)
    result.adapterId = value.adapterId
    result.conditions = JSON.parse(rule.conditions).map(x => {
      const { field, value, condition } = x
      return new Condition(field, value, condition)
    })
    result.actions = new Map(JSON.parse(rule.actions))

    result.disabled = Boolean(rule.disabled)
    return result
  }
}
