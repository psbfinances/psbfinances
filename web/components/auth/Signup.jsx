'use strict'

import React from 'react'
import { FormHeader } from '../core/index.js'
import { observer } from 'mobx-react'
import Credentials from './Credentials.jsx'
import { authScreens } from './AuthModel.js'
import SubmitButton from './SubmitButton.jsx'
import { BackToLoginButton } from './Fields.jsx'

/**
 * Signup component.
 * @param {AuthModel} model
 */
let Signup = ({ model }) => {
  if (model.screen !== authScreens.SIGNUP) return null

  return (
    <div>
      <FormHeader>Create your account</FormHeader>
      <Credentials model={model} />
      <SubmitButton model={model} />
      <BackToLoginButton model={model} />
    </div>
  )
}
Signup = observer(Signup)

export default Signup
