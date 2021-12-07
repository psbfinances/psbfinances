'use strict'

import React from 'react'
import { observer } from 'mobx-react'

/**
 * Field entry error.
 * @param {Object} errors
 * @param {string} fieldName
 * @return {JSX.Element|null}
 * @constructor
 */
let Error = ({ errors, fieldName }) => {
  return !errors[fieldName]
    ? null
    : <div className='error'>{errors[fieldName]}</div>
}

Error = observer(Error)
export default Error
