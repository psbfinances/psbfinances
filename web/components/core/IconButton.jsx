'use strict'

import React from 'react'
import ReactTooltip from 'react-tooltip'

/**
 * Icon button for list toolbars.
 * @param {string} icon - font-awesome icon
 * @param {string} label
 * @param {boolean} disabled
 * @param {function} handleClick
 * @param {string} tooltip
 * @return {JSX.Element}
 * @constructor
 */
const IconButton = ({ icon, label, disabled, handleClick, tooltip }) => {
  return <button
    data-tip={tooltip}
    aria-label={label}
    name={label}
    className='btn btn-primary ms-2'
    disabled={disabled}

    onClick={handleClick}>
    <ReactTooltip />
    <i className={icon} />
  </button>
}

export default IconButton
