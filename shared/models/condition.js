'use strict'

export const op = {
  EQ: '=',
  INCL: '$'
}

export default class Condition {
  field = ''
  condition = op.EQ
  value = ''

  /**
   * @param {string} field
   * @param {string} condition
   * @param {string|number} value
   */
  constructor (field, value, condition = op.EQ) {
    this.condition = condition
    this.field = field
    this.value = isNaN(value) ? value : Number.parseFloat(value)
  }

  /**
   * Check whether transaction matches the conditions.
   * @param {Object} data
   * @return {boolean}
   */
    matched (data) {
    let result = false
    if (!data[this.field]) return false
    const value = this.field === 'amount'
      ? Math.abs(data[this.field] / 100)
      : data[this.field]

    switch (this.condition) {
      case op.EQ:
      result = value.toString() === this.value.toString()
        break
      case op.INCL:
        result = value.toString().toLowerCase().includes(this.value.toLowerCase())
        break
    }

    return result
  }
}
