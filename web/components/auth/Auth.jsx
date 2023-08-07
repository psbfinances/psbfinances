'use strict'

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import ResetPassword from './ResetPassword.jsx'
import { observer } from 'mobx-react'
import { authScreens } from './AuthModel.js'

/**
 * Login component.
 * @param {AuthModel} model
 */
let Auth = ({model}) => {
  const navigate = useNavigate()

  useEffect(() => {
    const getData = async  () => {
      if (model.navigateUrl) return navigate(model.navigateUrl)

      const resetPasswordToken = new URL(window.location.href).searchParams.get('token')
      if (resetPasswordToken) {
        const validate = await model.validatePasswordResetToken(resetPasswordToken)
        if (!validate.valid) {
          model.screen = authScreens.FORGOTTEN
          return
        }
        model.screen = authScreens.RESET
        return
      }
      model.screen = authScreens.LOGIN
    }
    getData()
  }, [model.navigateUrl])

  return (
    <div className='authLoginContainer'>
      <Login model={model} />
      <Signup model={model} />
      <ForgotPassword model={model} />
      <ResetPassword model={model} />
    </div>
  )
}
Auth=observer(Auth)

export default Auth
