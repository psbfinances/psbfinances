'use strict'

import React from 'react'
import {
  AccountInput,
  BusinessInput,
  CategoryInput,
  DescriptionInput,
  FormButtons,
  InputField
} from '../../core'
import { observer } from 'mobx-react'

/**
 * Rule form.
 * @param {ImportRuleListModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
let ImportRuleForm = ({ model }) => {
  if (model.formHidden) return null

  return <div>
    <div id='dataContainer' className='frm formDataContainer'>
      <div id='formContainer' data-testid='formContainer' className='formContainer'>
        <div className='mb-3'>
          <input
            id='disabled'
            name='disabled'
            key='disabledCheckbox'
            className='form-check-input'
            type='checkbox'
            onChange={model.handleChange}
            checked={model.editItem.disabled} />
          <label className='form-check-label ms-2' htmlFor='disabled'>
            Rule disabled
          </label>
        </div>
        <hr/>
        <h5>IF</h5>
        <AccountInput
          id='accountId'
          label='Account'
          value={model.editItem.condition.accountId}
          handleChange={model.handleChange} />

        <InputField
          label='Description (contains)'
          id='description'
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.condition.description} />

        <InputField
          label='Amount'
          id='amount'
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.condition.amount} />

        <hr />
        <h5>THEN</h5>

        <DescriptionInput
          id='action.description'
          value={model.editItem.action.description}
          handleChange={model.handleDescriptionChange} />
        <BusinessInput
          id='action.businessId'
          value={model.editItem.action.businessId}
          handleChange={model.handleChange} />
        <CategoryInput
          id='action.categoryId'
          value={model.editItem.action.categoryId}
          businessId={model.editItem.action.businessId}
          handleChange={model.handleChange} />

        <InputField
          label='Trip distance'
          id='action.tripDistance'
          hidden={model.tripDistanceHidden}
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.action.tripDistance} />

        <FormButtons model={model} />
      </div>
    </div>
  </div>
}
ImportRuleForm = observer(ImportRuleForm)

export default ImportRuleForm
