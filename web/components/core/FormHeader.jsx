'use strict'

import * as React from 'react'

/**
 * FormHeader component.
 * @param {Object} props
 * @return {JSX.Element}
 */
const FormHeader = ({ children }) =>
  <header className='authFormHeader'>
    {children}
  </header>

export default FormHeader
