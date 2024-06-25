'use strict'

import * as React from 'react'
import { FieldGroupActionContainer } from './StylesBusiness.jsx'

const emptyFunc = () => {}

/**
 * CancelOkButtons component.
 * @param {JSX.Element} [children]
 * @param {string} cancelLabel
 * @param {string} okLabel
 * @param {function} onCancelClick
 * @param {function} onOkClick
 * @return {React.JSX.Element}
 * @constructor
 */
const CancelOkButtons = ({
  children,
  cancelLabel = 'Cancel',
  okLabel = 'OK',
  onCancelClick = emptyFunc,
  onOkClick = emptyFunc
}) =>
  <div className='row mt-4 mb-3'>
    <FieldGroupActionContainer className='col-md-12'>
      <button className='btn btn-link btn-sm' onClick={onCancelClick}>{cancelLabel}</button>
      <button className='btn btn-primary btn-sm' onClick={onOkClick}>{okLabel}</button>
      {children}
    </FieldGroupActionContainer>
  </div>

export default CancelOkButtons
