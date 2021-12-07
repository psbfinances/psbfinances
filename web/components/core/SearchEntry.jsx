'use strict'

import React from 'react'

const SearchEntry = ({ value, handleChange, handleKey }) =>
  <div className='mt-3 ms-2'>
    <div className='input-group'>
    <span className='input-group-text' id='basic-addon1' style={{backgroundColor: ''}}>
      <i className='fas fa-search text-white' aria-hidden='true' />
    </span>
      <input
        id='searchValue'
        name='search'
        className='form-control form-control-sm'
        type='text'
        placeholder='Search'
        aria-label='Search'
        value={value}
        onKeyDown={handleKey}
        onChange={handleChange}
      />
    </div>
  </div>
export default SearchEntry
