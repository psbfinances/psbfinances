'use strict'

const OPTION_ID = '-1'
/** @type {SelectOption[]} */
const emptyOptions = [{ value: OPTION_ID, label: '' }, { value: 'p', label: 'Personal' }]

export default class BusinessOptions {
  options = emptyOptions

  constructor (businesses) {
    this.options = emptyOptions.concat(businesses.map(x => ({ value: x.id, label: x.nickname })))
  }

  getOptions () {
    return this.options
  }
}
