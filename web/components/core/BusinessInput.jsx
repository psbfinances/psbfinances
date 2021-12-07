'use strict'

import React from 'react'
import { c } from '../../../shared/core/index.js'
import { rootStore } from '../../stores/rootStore.js'

const BusinessInput = ({ id, label, value, handleChange }) => {
  const options = rootStore.masterDataStore.businessOptions
  const fieldLabel = label || 'Type'

  return <div className='mb-3'>
    <label htmlFor={id} className='form-label'>{fieldLabel}</label>
    <select
      id={id}
      name={id}
      className='form-select'
      onChange={handleChange}
      value={value || c.selectId.NONE}>
      {options.map(x => <option value={x.value} key={x.value}>{x.label}</option>)}
    </select>
  </div>
}

export default BusinessInput
