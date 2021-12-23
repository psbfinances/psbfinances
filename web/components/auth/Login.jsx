'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import Credentials from './Credentials.jsx'
import { authScreens } from './AuthModel.js'
import SubmitButton from './SubmitButton.jsx'

/**
 * Login component.
 * @param {AuthModel} model
 */
let Login = ({model}) => {
  if (model.screen !== authScreens.LOGIN) return null

  return (
    <div>
      <Credentials model={model} />
      <SubmitButton model={model}>
        <ForgotPasswordLink model={model}/>
      </SubmitButton>
      <div>
        <button
          className='btn btn-success mx-auto mt-2 mb-2'
          style={{ width: '80px', display: 'block' }}
          onClick={model.handleSignupFormClick}
          id='signUpButton'>Sign up
        </button>
      </div>
    </div>
  )
}
Login = observer(Login)

/**
 * Forgot password link.
 * @param {AuthModel} model
 */
let ForgotPasswordLink = ({model}) =>
  <div className='mt-2' style={{ textAlign: 'center' }}>
    <button className='btn btn-link' onClick={model.handleForgotPasswordClick}>Forgot password?</button>
  </div>

ForgotPasswordLink = observer(ForgotPasswordLink)

export default Login
