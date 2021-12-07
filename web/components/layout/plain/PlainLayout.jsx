'use strict'

import * as React from 'react'
import styled from 'styled-components'
import PlainHeader from './PlainHeader.jsx'
import PlainFooter from './PlainFooter.jsx'
import ErrorBoundary from '../../core/ErrorBoundary.jsx'

/**
 * Layout component.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @return {JSX.Element}
 */
const PlainLayout = props =>
  <div className='gray-bg'>
    <PlainHeader />
    <div id='main'>
      <ErrorBoundary>
        <div className='container' id='content'>
          <div className='row'>
            <Intro />
            <AuthForm {...props} />
          </div>
        </div>
      </ErrorBoundary>
    </div>
    <PlainFooter />
  </div>

/**
 * Introduction panel.
 * @return {JSX.Element}
 */
const Intro = () =>
  <IntroContainer className='col-xs-12 col-sm-12 col-md-7 col-lg-8 hidden-xs hidden-sm'>
    <H1>Welcome to psbFinances</H1>
    <h3 style={{textAlign: 'center', marginTop: '27px'}}>Your personal and small business finances in one place.</h3>
  </IntroContainer>

/**
 * Form placeholder.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @return {JSX.Element}
 */
const AuthForm = props =>
  <div className='col-xs-12 col-sm-12 col-md-5 col-lg-4'>
    {props.children}
  </div>

const H1 = styled.h1`
  margin-top: 15px;
  font-size: 24px !important;
  color: #B88766;
  text-align: center;
`
  // background-image: url('/images/landing-page-background.jpg');
const IntroContainer = styled.div`
  height: 422px;
  background-size: cover;
`
export default PlainLayout
