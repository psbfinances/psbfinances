'use strict'

import React from 'react'

/**
 *
 * @param {string} id
 * @param {boolean} [visible]
 * @param {boolean} [labelVisible]
 * @param {string} [label]
 * @param {boolean} [disabled]
 * @param {function} handler
 * @param {string} value
 * @param {SelectOption[]} options
 * @return {JSX.Element}
 * @constructor
 */
const SelectField = ({id, visible, labelVisible, label, disabled, handler, value, options}) => {
  const fieldVisible = visible === undefined ? true : visible
  if (!fieldVisible) return null

  const fieldLabelVisible = labelVisible === undefined ? true : labelVisible
  const fieldDisabled = disabled === undefined ? false : disabled
  const fieldLabel = label || ''
  const fieldValue = value || (options.length > 0 ? options[0].value : null)

  return <div className='mt-2'>
    {fieldLabelVisible && <label htmlFor={id}>{fieldLabel}</label>}
    <div>
      <select
        id={id}
        name={id}
        disabled={fieldDisabled}
        className='form-select'
        onChange={handler}
        value={fieldValue}>
        {options.map(x => <option value={x.value} key={x.value}>{x.label}</option>)}
      </select>
    </div>
  </div>
}

export default SelectField
