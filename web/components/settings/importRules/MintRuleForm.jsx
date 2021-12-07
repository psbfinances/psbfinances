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
import { c } from '../../../../shared/core/index.js'

/**
 * Rule form for Mint transactions.
 * @param {ImportRuleListModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
let MintRuleForm = ({ model }) => {
  if (model.formHidden) return null
  const businessId = model.editItem && model.hasBusinesses ? model.editItem.action.businessId : c.PERSONAL_TYPE_ID

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
        <InputField
          label='Account'
          id='Account Name'
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.condition['Account Name']} />

        <InputField
          label='Category'
          id='Category'
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.condition.Category} />

        <InputField
          label='Description (contains)'
          id='Description'
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.condition.Description} />

        <InputField
          label='Notes (contains)'
          id='Notes'
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.condition.Notes} />

        <InputField
          label='Tag (contains)'
          id='Labels'
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.condition.Labels} />

        <hr />
        <h5>THEN</h5>

        <AccountInput
          id='action.accountId'
          label='Account'
          value={model.editItem.action.accountId}
          handleChange={model.handleChange} />

        <DescriptionInput
          id='action.description'
          value={model.editItem.action.description}
          handleChange={model.handleDescriptionChange} />
        {model.hasBusinesses && <BusinessInput
          id='action.businessId'
          value={businessId}
          handleChange={model.handleChange} />}
        <CategoryInput
          id='action.categoryId'
          value={model.editItem.action.categoryId}
          businessId={businessId}
          handleChange={model.handleChange} />

        <FormButtons model={model} />
      </div>
    </div>
  </div>
}
MintRuleForm = observer(MintRuleForm)

export default MintRuleForm
