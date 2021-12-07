'use strict'

import React from 'react'

/**
 * Icon button for list toolbars.
 * @param {string} icon - font-awesome icon
 * @param {string} label
 * @param {boolean} disabled
 * @param {function} handleClick
 * @return {JSX.Element}
 * @constructor
 */
const IconButton = ({ icon, label, disabled, handleClick }) => {
  return <button aria-label={label} name={label} className='btn btn-primary ms-2' disabled={disabled} onClick={handleClick}>
    <i className={icon} />
  </button>
}

export default IconButton
