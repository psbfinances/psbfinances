'use strict'

import validator from 'validator'
import cuid from 'cuid'

const userModel = {
  /**
   @return {User}
   * @param {string} [tenantId]
   * @param {string} [email]
   * @param {string} [password]
   */
  getNew: (tenantId, email, password) => {
    /** @type {User} */
    const result = {
      id: `new-${cuid()}`,
      nickname: '',
      fullName: '',
      email: '',
      password: '',
      hasAccess: true
    }
    if (tenantId && email && password) {
      result.id = cuid()
      result.tenantId = tenantId
      result.email = email
      result.password = password
      result.nickname = email
      result.fullName = email
    }

    return result
  },

  /**
   * Validates user data.
   * @param {User} user
   * @return {Object}
   */
  validate: (user) => {
    let errors = {}
    if (validator.isEmpty(user.nickname, { ignore_whitespace: true })) errors.nickname = 'Please enter nickname'
    if (validator.isEmpty(user.fullName, { ignore_whitespace: true })) errors.fullName = 'Please enter full name'
    if (validator.isEmpty(user.email, { ignore_whitespace: true })) errors.email = 'Please enter email'
    if (!validator.isEmail(user.email)) errors.email = 'Invalid email'

    return errors
  }
}

export default userModel
