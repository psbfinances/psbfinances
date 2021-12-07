'use strict'

import validator from 'validator'
import cuid from 'cuid'

const businessModel = {
  /**
    @return {Business}
   */
  getNew: () => {
    return {
      id: `new-${cuid()}`,
      nickname: '',
      fullName: ''
    }
  },

    /**
   * Validates business data.
   * @param {Business} business
   * @return {Object}
   */
  validate: (business) => {
    let errors = {}
    if (validator.isEmpty(business.nickname, { ignore_whitespace: true })) errors.nickname = 'Please enter nickname'
    if (validator.isEmpty(business.fullName, { ignore_whitespace: true })) errors.fullName = 'Please enter full name'

    return errors
  }
}

export default businessModel
