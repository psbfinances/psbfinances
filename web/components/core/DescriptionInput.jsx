'use strict'

import React from 'react'
import DescriptionAutoComplete from '../transactionForm/DescriptionAutoComplete.jsx'

const DescriptionInput = ({ id, label, value, handleChange }) => {
  const fieldId = id || 'description'
  const fieldLabel = label || 'Description'

  return <div className='mb-3 mt-1'>
    <label htmlFor={fieldId} className='form-label'>{fieldLabel}</label>
    <DescriptionAutoComplete
      id={id}
      handleChange={handleChange}
      description={value} />
  </div>
}

export default DescriptionInput
