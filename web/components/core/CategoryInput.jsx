'use strict'

import React from 'react'
import { c } from '../../../shared/core/index.js'
import { rootStore } from '../../stores/rootStore.js'

const CategoryInput = ({ id, label, value, businessId, handleChange }) => {
  const options = rootStore.masterDataStore.categoryOptions.getOptions(value, businessId)
  const fieldId = id || 'categoryId'
  const fieldLabel = label || 'Category'

  return <div className='mb-3'>
    <label htmlFor={fieldId} className='form-label'>{fieldLabel}</label>
    <select
      id={fieldId}
      name={fieldId}
      className='form-select'
      onChange={handleChange}
      value={value || c.selectId.NONE}>
      {options.map(x => <option value={x.value} key={x.value}>{x.label}</option>)}
    </select>
  </div>
}

export default CategoryInput
