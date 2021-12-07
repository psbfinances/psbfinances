'use strict'

import * as React from 'react'
import styled from 'styled-components'

const Header = styled.header`
  border-bottom: 1px dashed rgba(0, 0, 0, .2);
  background-color: #f7f7f7;
  font-size: 16px;
  font-weight: 300;
  color: #B88766;
  padding: 10px 14px 10px;
`
/**
 * FormHeader component.
 * @param {Object} props
 * @return {JSX.Element}
 */
const FormHeader = ({ children }) =>
  <Header>
    {children}
  </Header>

export default FormHeader
