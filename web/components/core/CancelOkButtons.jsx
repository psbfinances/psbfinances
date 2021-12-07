'use strict'

import * as React from 'react'
import { FieldGroupActionContainer } from './StylesBusiness.jsx'

/**
 * @typedef {Object} CancelOkButtonsProps
 * @property {React.ReactNode} [children]
 * @property {string} cancelLabel
 * @property {string} okLabel
 * @property {Function} onCancelClick
 * @property {Function} onOkClick
 */

const emptyFunc = () => {}

/**
 * CancelOkButtons component.
 * @param {CancelOkButtonsProps} props
 * @return {JSX.Element}
 */
const CancelOkButtons = ({ children, cancelLabel = 'Cancel', okLabel = 'Save', onCancelClick = emptyFunc, onOkClick = emptyFunc }) =>
  <div className='row'>
    <FieldGroupActionContainer className='col-md-12'>
      <button className='btn btn-link btn-sm' onClick={onCancelClick}>{cancelLabel}</button>
      <button className='btn btn-primary btn-sm' onClick={onOkClick}>{okLabel}</button>
      {children}
    </FieldGroupActionContainer>
  </div>

export default CancelOkButtons
