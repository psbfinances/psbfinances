'use strict'

import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Footer, LoginContainer } from './authStyles'
import { FormHeader } from '../core/index.js'
import { appController } from '../../../shared/core/index.js'
import { authApi } from '../../../shared/apiClient/index.js'

/**
 * Login component.
 */
const Auth = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [signUpVisible, setSignUpVisible] = useState(false)

  /**
   * Handles form submit.
   * @param {Event} e
   * @return {Promise<void>}
   */
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const resp = signUpVisible
        ? await authApi.signUp({ email, password })
        : await authApi.login({ email, password })
      const { user, token, error } = resp.data
      if (error) return setError(error)

      appController.setAuthentication(user, token)

      setError('')
      navigate('/app/transactions')
    } catch (er) {
      setError('Something went wrong. Please try again.')
    }
  }

  useEffect(() => {
    if (appController.user) navigate('/app/transactions')
  }, [])

  const handleEmailChange = e => setEmail(e.target.value)
  const handlePasswordChange = e => setPassword(e.target.value)

  const handleSignUpClick = e => {
    console.log('handleSignUpClick')
    e.preventDefault()
    setEmail('')
    setPassword('')
    setError('')
    setSignUpVisible(!signUpVisible)
  }

  return (
    <LoginContainer>
      <div>
        {signUpVisible && <FormHeader>Create your account</FormHeader>}
        <div style={{ padding: '20px' }}>
          <div className='form-group'>
            <input
              id='email'
              type='email'
              className='form-control'
              autoComplete='username'
              placeholder='Email'
              onChange={handleEmailChange}
              value={email} />
          </div>

          <div className='form-group mt-4'>
            <input
              id='password'
              type='password'
              className='form-control'
              placeholder={signUpVisible ? 'New password' : 'Password'}
              autoComplete='current-password'
              onChange={handlePasswordChange}
              value={password} />
          </div>
          <div className='mt-3'>
            {error && <span className='text-danger m-b-2'>{error}</span>}
          </div>
          {!signUpVisible && false && <ForgotPasswordLink />}

        </div>
        <Footer>
          <button
            id='loginButton'
            className='btn'
            onClick={handleSubmit}
          >{signUpVisible ? 'Sign Up' : 'Log In'}</button>
        </Footer>
        <div>
          {!signUpVisible && <button
            className='btn btn-success mx-auto mt-2 mb-2'
            style={{ width: '80px', display: 'block' }}
            onClick={handleSignUpClick}
            id='signUpButton'>Sign up
          </button>}
          {signUpVisible &&
          <div>
            <div
              onClick={handleSignUpClick}
              className='mx-auto mt-2 mb-2'
              style={{ width: '250px', display: 'block' }}>Or
              <button className='btn btn-link'>Log In</button> if you have account already.
            </div>
          </div>}
        </div>

      </div>

    </LoginContainer>
  )
}

const ForgotPasswordLink = () =>
  <div className='mt-4'>
    <Link to='/forgot_password'>Forgot password?</Link>
  </div>

export default Auth
