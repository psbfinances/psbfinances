'use strict'

import c from './constants.js'
import cuid from 'cuid'

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormat = { month: 'short', day: 'numeric' }

const utils = {
  roundAmount: amount => Math.round((amount) * 100) / 100,

  formatAmount: amount => formatter.format(amount),

  getNewId: () => `${c.NEW_ID_PREFIX}${cuid()}`,

  isNewId: id => id.includes(c.NEW_ID_PREFIX),

  formatDate: date => new Date(date).toLocaleDateString('en-gb', dateFormat),

  isEmpty: obj => Object.keys(obj).length === 0,

  /**
   * Checks whether form validation error object has errors.
   * @param {Object} errors
   * @return {boolean}
   */
  hasError: errors => errors && Object.keys(errors).length > 0,

  /**
   * Gets URL search param for search value.
   * @param [value]
   * @return {string}
   */
  getSearchString: value => {
    if (!value) return ''

    const search = value.trim()
    if (!search || search === '') return ''

    if (isNaN(search)) return `description=${search}`

    const hasDecimals = search.includes('.')
    return hasDecimals ? `amount=${search}` : `amount>=${search}&amount<=${parseInt(search) + 1}`
  }
}

export default utils
