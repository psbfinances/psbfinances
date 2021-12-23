'use strict'

import React from 'react'
import { FormHeader } from '../core/index.js'
import { observer } from 'mobx-react'
import { authScreens } from './AuthModel.js'
import SubmitButton from './SubmitButton.jsx'
import { Error, Password } from './Fields.jsx'

/**
 * ResetPassword component.
 * @param {AuthModel} model
 */
let ResetPassword = ({ model }) => {
  if (model.screen !== authScreens.RESET) return null

  return (
    <div>
      <FormHeader>Create new password</FormHeader>
      <div style={{ padding: '20px 20px 5px 20px' }}>
        <Password model={model} placeholder='New password'/>
        <Password model={model} fieldName='password2' placeholder='Confirm password' />
        <Error model={model} />
      </div>

      <SubmitButton model={model} />
    </div>
  )
}
ResetPassword = observer(ResetPassword)

export default ResetPassword
