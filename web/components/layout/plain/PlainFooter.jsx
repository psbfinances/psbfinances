'use strict'

import * as React from 'react'
import styled from 'styled-components'

/**
 * Footer component.
 */
const PlainFooter = () =>
  <FooterContainer className='row'>
    <FooterWrapper>
      <div>
        <CopyrightContainer>
          2020-{new Date().getFullYear()}, psbFinances.
        </CopyrightContainer>
      </div>
    </FooterWrapper>
  </FooterContainer>

const FooterContainer = styled.div`
  margin-top: 15px;
  background: linear-gradient(to bottom,rgba(0,0,0,.14),rgba(0,0,0,.03) 3px,transparent);
  font-size: 11px;
`
const FooterWrapper = styled.footer`
  margin-top: 30px;
  width: 500px;
  text-align: center;
  margin-right: auto;
  margin-left: auto;
`
const CopyrightContainer = styled.div`
  line-height: 30px;
  color: #B88766;
`
export default PlainFooter
