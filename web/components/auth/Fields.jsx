'use strict'

import React from 'react'
import { observer } from 'mobx-react'

/**
 * Email input field.
 * @param {AuthModel} model
 * @return {JSX.Element}
 * @constructor
 */
let Email = ({ model }) => {
  return <div className='form-group'>
    <input
      id='email'
      type='email'
      name='email'
      className='form-control'
      autoComplete='username'
      placeholder='Email'
      onChange={model.handleChange}
      value={model.email} />
  </div>
}
Email = observer(Email)

/**
 * Password input field.
 * @param {AuthModel} model
 * @param {?string} fieldName
 * @param {?string} placeholder
 * @return {JSX.Element}
 * @constructor
 */
let Password = ({ model, fieldName, placeholder }) => {
  const field = fieldName || 'password'
  return <div className='form-group mt-4'>
    <input
      id={field}
      name={field}
      type='password'
      className='form-control'
      placeholder={placeholder || 'Password'}
      onChange={model.handleChange}
      value={model[field]} />
  </div>
}
Password = observer(Password)

let Error = ({ model }) => {
  return <div className='mt-3'>
    <span className='text-danger m-b-2'>{model.error}</span>
  </div>
}
Error = observer(Error)

const BackToLoginButton = ({ model }) => {
  return <div>
    <div>
      <div style={{ textAlign: 'center' }}>
        <button className='btn btn-link' onClick={model.handleBackToLoginClick}>Back to Login</button>
      </div>
    </div>
  </div>

}
export {
  Email, Password, Error, BackToLoginButton
}
