'use strict'

import { makeAutoObservable } from 'mobx'
import validator from 'validator'
import { appController } from '@psbfinances/shared/core/index.js'
import { authApi } from '@psbfinances/shared/apiClient/index.js'

const authScreens = {
  EMPTY: 'empty',
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOTTEN: 'forgotten',
  RESET: 'reset'
}
const submitButtonLabels = {
  LOGIN: 'Log In',
  SIGNUP: 'Sign up',
  FORGOTTEN: 'Send Login Link',
  RESET: 'Save'
}
const HOME_URL = '/app/transactions'

/**
 * Authentication data model.
 * @class
 * @property {keyof typeof authScreens} screen
 * @property {string} email = ''
 * @property {string} password = ''
 * @property {string} password2 = ''
 * @property {string} error = ''
 * @property {?string} navigateUrl
 * @property {?string} resetPasswordToken
 */
export default class AuthModel {
  screen = authScreens.EMPTY
  email = ''
  password = ''
  password2 = ''
  error = ''
  navigateUrl

  constructor () {
    makeAutoObservable(this)
    if (appController.user) this.navigateUrl = HOME_URL
  }

  get submitButtonLabel () {
    switch (this.screen) {
      case authScreens.LOGIN:
        return submitButtonLabels.LOGIN
      case authScreens.SIGNUP:
        return submitButtonLabels.SIGNUP
      case authScreens.FORGOTTEN:
        return submitButtonLabels.FORGOTTEN
      case authScreens.RESET:
        return submitButtonLabels.RESET
    }
  }

  get tokenExpiredLabelVisible () {
    return Boolean(this.resetPasswordToken)
  }

  resetForm () {
    this.email = ''
    this.password = ''
    this.password2 = ''
    this.error = ''
    this.resetPasswordToken = null
  }

  handleChange = e => {
    this[e.target.name] = e.target.value
    this.error = ''
  }

  handleSignupFormClick = e => {
    e.preventDefault()
    this.resetForm()
    this.screen = this.screen === authScreens.SIGNUP ? authScreens.LOGIN : authScreens.SIGNUP
  }

  handleEnterKey = async e => {
    if (e.code === 'Enter') await this.processSubmit()
  }

  handleSubmit = async e => {
    e.preventDefault()
    await this.processSubmit()
  }

  async processSubmit () {
    switch (this.screen) {
      case authScreens.LOGIN:
      case authScreens.SIGNUP:
        await this.loginOrSignup()
        break
      case authScreens.FORGOTTEN:
        await this.requestResetPasswordLink()
        break
      case authScreens.RESET:
        await this.saveNewPassword()
        break
    }
  }

  saveNewPassword = async () => {
    const password = this.password.trim()
    const password2 = this.password2.trim()
    if (password !== password2 || !validator.isStrongPassword(password)) {
      this.error = 'Password is not strong enough'
      return
    }
    await authApi.savePassword(this.resetPasswordToken, password)
    this.screen = authScreens.LOGIN
    this.resetForm()
  }

  get submitButtonEnabled () {
    return this.screen !== authScreens.RESET ||
      (this.password2.trim().length > 0 && this.password === this.password2)
  }

  /**
   * Handles form submit.
   * @return {Promise<void>}
   */
  loginOrSignup = async () => {
    try {
      const { email, password } = this
      const resp = this.screen === authScreens.LOGIN
        ? await authApi.login({ email, password })
        : await authApi.signUp({ email, password })
      const { user, token, error } = resp.data
      if (error) return this.error = error

      appController.setAuthentication(user, token)
      this.navigateUrl = HOME_URL
    } catch (er) {
      this.error = 'Something went wrong. Please try again.'
    }
  }

  handleForgotPasswordClick = e => {
    e.preventDefault()
    this.resetForm()
    this.screen = authScreens.FORGOTTEN
  }

  handleBackToLoginClick = e => {
    e.preventDefault()
    this.resetForm()
    this.screen = authScreens.LOGIN
  }

  requestResetPasswordLink = async () => {
    const result = await authApi.resetPassword(this.email)
    if (result.data.errors) {
      this.error = result.data.errors.email
      return
    }
    this.resetForm()
    this.screen = authScreens.LOGIN
    return Promise.resolve()
  }

  validatePasswordResetToken = async token => {
    if (!token) return Promise.resolve({ valid: false })

    this.resetPasswordToken = token
    const result = await authApi.validateToken(this.resetPasswordToken)
    return result.data
  }
}

export {
  authScreens
}
