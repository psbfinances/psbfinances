'use strict'

import * as React from 'react'
import styled from 'styled-components'

/**
 * ErrorPage component.
 * @return {JSX.Element}
 */
const ErrorPage = () =>
  <section className='content'>
    <ErrorDiv>
      <Headline className='text-danger'>500</Headline>
      <ErrorContent>
        <h3><i className='fas fa-exclamation-triangle text-danger' /> Oops! Something went wrong.</h3>
        <p>
          We will work on fixing that right away.
          Meanwhile, you may <a href='/'>return to the Home page</a>.
        </p>
      </ErrorContent>
    </ErrorDiv>

  </section>

const ErrorDiv = styled.div`
  margin: 20px 0;
  width: 500px;
`
const Headline = styled.h2`
  float: left;
  font-size: 100px;
  font-weight: 300;
`
const ErrorContent = styled.div`
  display: block;
  margin-left: 190px;
`

export default ErrorPage
