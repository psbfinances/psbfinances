'use strict'

import React from 'react'
import { Tooltip } from 'react-tooltip'
import classNames from 'classnames'

/**
 * Icon button for list toolbars.
 * @param {string} icon - font-awesome icon
 * @param {string} label
 * @param {boolean} disabled
 * @param {function} handleClick
 * @param {string} tooltip
 * @param {boolean} active
 * @param {string} modalToggle=''
 * @param {string} modalTarget=''
 * @return {JSX.Element}
 * @constructor
 */
const IconButton = ({ icon, label, disabled, handleClick, tooltip, active = false, modalToggle = '', modalTarget = '' }) => {
  return <button
    data-tip={tooltip}
    aria-label={label}
    data-bs-toggle={modalToggle}
    data-bs-target={modalTarget}
    name={label}
    className={classNames('btn btn-primary ms-2', {active: active})}
    disabled={disabled}

    onClick={handleClick}>
    <Tooltip />
    <i className={icon} />
  </button>
}

export default IconButton
