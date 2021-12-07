'use strict'

import validator from 'validator'
import cuid from 'cuid'

const carModel = {
  /**
    @return {Car}
   */
  getNew: () => {
    return {
      id: `new-${cuid()}`,
      description: '',
      isInUse: true
    }
  },

    /**
   * Validates data.
   * @param {Car} car
   * @return {Object}
   */
  validate: (car) => {
    let errors = {}
    if (validator.isEmpty(car.description, { ignore_whitespace: true })) errors.nickname = 'Please enter description'

    return errors
  }
}

export default carModel
