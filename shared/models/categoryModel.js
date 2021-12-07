'use strict'

import isEmpty from 'validator/lib/isEmpty.js'
import cuid from 'cuid'
import {c} from '../core/index.js'

const categoryModel = {
  /**
    @return {typeof psbf.Category}
   */
  getNew: () => {
    return {
      id: `${c.NEW_ID_PREFIX}${cuid()}`,
      tenantId: '',
      name: '',
      isPersonal: true,
      type: c.transactionType.EXPENSE
    }
  },

    /**
   * Validates category data.
   * @param {psbf.Category} category
   * @return {Object}
   */
  validate: (category) => {
    let errors = {}
    if (isEmpty(category.name, { ignore_whitespace: true })) errors.name = 'Please enter name'

    return errors
  }
}

export default categoryModel
