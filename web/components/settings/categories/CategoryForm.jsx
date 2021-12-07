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

  const readOnly = !model.editItem.isPersonal

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

        {!readOnly && <FormButtons model={model} />}
      </div>
    </div>
  </div>
}
CategoryForm = observer(CategoryForm)

export default CategoryForm
