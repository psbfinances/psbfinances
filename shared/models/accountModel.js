'use strict'

import validator from 'validator'
import cuid from 'cuid'

const accountModel = {
  /**
    @return {FinancialAccount}
   */
  getNew: () => {
    return {
      id: `new-${cuid()}`,
      shortName: '',
      fullName: '',
      type: 'checking',
      openingBalance: 0,
      isDefault: false,
      closed: false,
      visible: true,
      deleted: false,
      balance: 0
    }
  },

    /**
   * Validates account data.
   * @param {FinancialAccount} account
   * @return {Object}
   */
  validate: (account) => {
    let errors = {}
    if (validator.isEmpty(account.shortName, { ignore_whitespace: true })) errors.shortName = 'Please enter short name'
    if (!validator.isLength(account.shortName, { min: 3, max: 25 })) errors.shortName = 'Invalid short name'
    if (validator.isEmpty(account.fullName, { ignore_whitespace: true })) errors.fullName = 'Please enter full name'

    return errors
  }
}

export default accountModel
