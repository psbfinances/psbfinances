'use strict'

import React from 'react'
import classNames from 'classnames'

/**
 * Input field (HTML <input />)
 * @param {Object} props
 * @return {JSX.Element}
 * @constructor
 */
const InputField = props => {
  const { label, errors, value, handleChange, hidden, ...others } = props
  if (hidden) return null

  return (
    <div className='mb-3'>
      <label htmlFor={others.id} className='form-label'>{label}</label>

      <input
        name={others.id}
        className={classNames(['form-control', { 'is-invalid': errors[others.id] }])}
        {...others}

        value={value || ''}
        onChange={handleChange} />
      <div data-testid='errorText' className='invalid-feedback'>
        {errors ? errors[others.id] : ''}
      </div>
    </div>
  )
}

export default InputField
