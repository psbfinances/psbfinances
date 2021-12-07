'use strict'

import React from 'react'

/**
 * Input checkbox field (HTML <input />)
 * @param {Object} props
 * @return {JSX.Element}
 * @constructor
 */
const CheckboxField = props => {
  const { label, errors, value, handleChange, ...others } = props
  return (
    <div className='mb-3'>
      <input
        name={others.id}
        className='form-check-input'
        type='checkbox'
        {...others}
        checked={Boolean(value)}
        onChange={handleChange} />
      <label className='form-check-label ms-1' htmlFor={others.id}>
        {label}
      </label>
    </div>
  )
}

export default CheckboxField
