'use strict'

import React from 'react'
import styled from 'styled-components'

/**
 * ButtonOk component.
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {boolean} props.loading
 * @return {JSX.Element}
 */
const ButtonOk = ({ id = 'okButton', label = 'OK', loading = false }) =>
  <Button
    id={id}
    type='submit'
    className='btn'
    disable={loading ? 'disable' : ''}
  >
    {label}
  </Button>

const Button = styled.button`
  height: 31px;
  margin: 10px 0 0 5px;
  padding: 0 22px;
  background-color: #B88766;
  color: white;
  width: 100%;
  font: 300 15px/29px 'Open Sans',Helvetica,Arial,sans-serif;
  cursor: pointer;
`
export default ButtonOk
