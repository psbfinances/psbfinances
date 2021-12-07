'use strict'

import React, { useMemo } from 'react'
import { c } from '../../../shared/core/index.js'
import { rootStore } from '../../stores/rootStore.js'

const AccountInput = ({ id, label, value, handleChange }) => {
  if (!id) return null

  const options = useMemo(() => {
    return rootStore.masterDataStore.accountOptions
  }, [])
  const fieldLabel = useMemo(() => label || 'Account', [label])
  const fieldId = useMemo(() => id || 'accountId', [id])

  return <div className='mb-3'>
    <label htmlFor={fieldId} className='form-label'>{fieldLabel}</label>
    <select
      id={fieldId}
      name={fieldId}
      className='form-select'
      onChange={handleChange}
      value={value || c.selectId.NONE}>
      {options.map(x => <option value={x.id} key={x.id}>{x.shortName}</option>)}
    </select>
  </div>
}

export default AccountInput
