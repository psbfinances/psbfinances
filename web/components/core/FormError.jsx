'use strict'

import * as React from 'react'

const FormError = ({ message = '' }) => message.length > 0
  ? <div className='alert alert-danger' role='alert'>{message}</div>
  : null

export default FormError
