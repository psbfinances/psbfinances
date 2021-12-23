'use strict'

import * as React from 'react'
import PlainHeader from './PlainHeader.jsx'
import PlainFooter from './PlainFooter.jsx'
import ErrorBoundary from '../../core/ErrorBoundary.jsx'
import { Auth, AuthModel } from '../../auth/index.js'

/**
 * Layout component.
 * @return {JSX.Element}
 */
const PlainLayout = () => {
  const authModel = new AuthModel()

  return <div className='gray-bg'>
    <PlainHeader />
    <div id='main'>
      <ErrorBoundary>
        <div className='container' id='content'>
          <div className='row'>
            <Intro />
            <AuthForm model={authModel}/>
          </div>
        </div>
      </ErrorBoundary>
    </div>
    <PlainFooter />
  </div>
}

/**
 * Introduction panel.
 * @return {JSX.Element}
 */
const Intro = () =>
  <div className='introContainer col-xs-12 col-sm-12 col-md-7 col-lg-8 hidden-xs hidden-sm'>
    <h1>Welcome to psbFinances</h1>
    <h3>Your personal and small business finances in one place.</h3>
  </div>

/**
 * Form placeholder.
 * @param {AuthModel} model
 * @return {JSX.Element}
 */
const AuthForm = ({model}) =>
  <div className='col-xs-12 col-sm-12 col-md-5 col-lg-4'>
    <Auth model={model} />
  </div>

export default PlainLayout
