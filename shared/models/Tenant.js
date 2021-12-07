'use strict'

import validator from 'validator'
import { utils } from '../core/index.js'

/**
 * @class
 * @classdesc Tenant database record.
 * @property {String} id
 * @property {String} shortName
 * @property {String} fullName
 * @property {Object} meta
 */
class TenantData {}

/**
 * Tenant model.
 */
export default class Tenant extends TenantData {
  /**
   * Validates model.
   * @return {TenantErrors}
   */
  validate () {
    const { isEmpty, isLength } = validator
    /** @type {TenantErrors} */
    const errors = {}
    if (isEmpty(this.fullName)) errors.fullName = 'Full name is required'
    if (isEmpty(this.shortName)) errors.shortName = 'Short name is required'
    if (!isLength(this.shortName, { max: 5 })) errors.shortName = 'Short name should be less than 5 characters'

    return { hasError: utils.hasError(errors), errors }
  }
}
