'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import { InputField, CheckboxField, FormButtons } from '../../core/index.js'

/**
 * Users form.
 * @param {UserListModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
let UserForm = ({ model }) => {
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
        <InputField
          label='Email'
          id='email'
          handleChange={model.handleChange}
          errors={model.formErrors}
          type='email'
          value={model.editItem.email} />
        <CheckboxField
          label='Has access'
          id='hasAccess'
          handleChange={model.handleChange}
          value={model.editItem.hasAccess} />

        <FormButtons model={model} />
      </div>
    </div>
  </div>
}
UserForm = observer(UserForm)

export default UserForm
