'use strict'

import React from 'react'
import { FormHeader } from '../core/index.js'
import { observer } from 'mobx-react'
import { authScreens } from './AuthModel.js'
import SubmitButton from './SubmitButton.jsx'
import { BackToLoginButton, Email, Error } from './Fields.jsx'

/**
 * ForgotPassword component.
 * @param {AuthModel} model
 */
let ForgotPassword = ({ model }) => {
  if (model.screen !== authScreens.FORGOTTEN) return null

  return (
    <div>
      <FormHeader>Trouble Logging In?</FormHeader>
      {model.tokenExpiredLabelVisible && <div style={{ padding: '10px 20px' }}>
        This link has expired. Please try again.
      </div>}
      <div style={{ padding: '10px 20px' }}>
        Enter your email address. You will receive an email with instructions to reset your password.<br/>
        Please enter your email address below.
      </div>
      <div style={{ padding: '20px 20px 5px 20px' }}>
        <Email model={model} />
        <Error model={model} />
      </div>

      <SubmitButton model={model} />
      <BackToLoginButton model={model} />
    </div>
  )
}
ForgotPassword = observer(ForgotPassword)

export default ForgotPassword
