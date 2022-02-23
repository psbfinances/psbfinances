'use strict'

import React from 'react'

/**
 * Accounts drop-down selector.
 * @param {string} id
 * @param {Object[]} items
 * @param {string} selectedId
 * @param {string} labelName
 * @return {JSX.Element}
 * @constructor
 */
const DropdownButton = ({ id, items, selectedId, labelName }) => {
  const getLabel = () => {
    try {
      return items.find(x => x.id === selectedId)[labelName]
    } catch (e) {
      console.error(items, selectedId)
    }
  }

  const label = getLabel()

  return <button
    className='btn btn-outline-primary dropdown-toggle mr-2 btn-sm'
    style={{ minWidth: '100px' }}
    type='button'
    id={id}
    data-testid={id}
    data-bs-toggle='dropdown'
    aria-expanded='false'>
    {label}
  </button>
}

export default DropdownButton
