'use strict'

import React from 'react'
import { FormButtons, InputField } from '../../core'
import { observer } from 'mobx-react'

/**
 * Category form.
 * @param {CategoryListModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
let CategoryForm = ({ model }) => {
  if (!model.editItem) return null

  // Both personal and business categories are editable: allow editing Name and Classification
  // (If in future some categories should be locked, add a dedicated flag such as `locked`.)
  const readOnly = false

  return <div>
    <div id='dataContainer' className='frm formDataContainer'>
      <div id='formContainer' data-testid='formContainer' className='formContainer'>

        <InputField
          label='Name'
          id='name'
          readOnly={readOnly}
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.name} />

        <div className='mb-3'>
          <label htmlFor='type' className='form-label'>Type</label>
          <select
            id='type'
            disabled={readOnly}
            name='type'
            className='form-select'
            onChange={model.handleChange}
            value={model.editItem.type}>
            <option value='i'>Income</option>
            <option value='e'>Expense</option>
            <option value='t'>Transfer</option>
          </select>
        </div>

        <div className='mb-3'>
          <label htmlFor='classification' className='form-label'>Classification</label>
          <select
            id='classification'
            /* Classification is intended for business categories; enable it when category is NOT personal */
            disabled={readOnly}
            name='classification'
            className='form-select'
            onChange={model.handleChange}
            value={model.editItem.classification || ''}>
            <option value=''>None</option>
            <option value='meal'>Meal</option>
            <option value='inventory'>Inventory</option>
          </select>
        </div>

        {!readOnly && <FormButtons model={model} />}
      </div>
    </div>
  </div>
}
CategoryForm = observer(CategoryForm)

export default CategoryForm
