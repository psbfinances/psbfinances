'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import { InputField, FormButtons } from '../../core/index.js'

/**
 * Business form.
 * @param {BusinessListModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
let BusinessForm = ({ model }) => {
  if (!model.editItem) return null

  return <div>
    <div id='dataContainer' className='frm formDataContainer'>
      <div id='formContainer' data-testid='formContainer' className='formContainer'>

        <InputField
          label='Nickname'
          id='nickname'
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.nickname} />
        <InputField
          label='Full name'
          id='fullName'
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.fullName} />

        <FormButtons model={model} />
      </div>
    </div>
  </div>
}
BusinessForm = observer(BusinessForm)

export default BusinessForm
