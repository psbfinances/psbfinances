'use strict'

import React from 'react'

/**
 * Text area field for a note-like entry.
 * @param {string} id
 * @param {string} label
 * @param {string} value
 * @param {number} rows
 * @param {function} handleChange
 * @return {JSX.Element}
 * @constructor
 */
export const NoteField = ({ id, label, value = '', rows = 3, handleChange }) => <div className='form-group'>
  <label htmlFor='note' className='form-label'>{label}</label>
  <textarea
    id={id}
    name={id}
    data-testid={id}
    rows={rows}
    className='form-control'
    placeholder={label}
    onChange={handleChange}
    value={value || ''} />
</div>
