'use strict'

import React from 'react'
import classNames from 'classnames'
import { useLocation } from 'react-router-dom'
// import queryString from 'query-string'
import { utils } from '../../../shared/core/index.js'

const ToolbarButton = ({ label, handleClick, style }) =>
  <button type='button' className={classNames('btn', 'btn-secondary', 'btn-sm', style || '')} onClick={handleClick}>
    {label}
  </button>

/**
 * Search text box.
 * @param {Function} onSubmit
 * @return {JSX.Element}
 * @constructor
 */
const SearchBox = ({ onSubmit }) => {
  const handleSubmit = e => {
    e.preventDefault()
    const value = document.getElementById('searchValue').value
    // TODO sanitize, trim, lower-case? and validate the value. Do nothing if something wrong (or error?).
    // TODO return '' if empty
    onSubmit(value)
  }

  const value = utils.getSearchFromLocation(useLocation())
  console.log({ code: 'SearchBox', value })

  // TODO clear button, better styling
  return (
    <form onSubmit={handleSubmit}>
      <div className='input-group md-form form-sm form-1 pl-0'>
        <div className='input-group-prepend'>
          <span className='input-group-text cyan lighten-2' id='basic-text1'>
            <i className='fas fa-search text-white' aria-hidden='true' />
          </span>
        </div>
        <input
          id='searchValue' className='form-control my-0 py-1' type='text'
          placeholder='Search' aria-label='Search' defaultValue={value}
        />
      </div>
    </form>
  )
}

const Pagination = () =>
  <div className='col-4'>
    <div className='btn-group mr-2 float-right' role='group' aria-label='First group'>
      <div className='input-group-prepend' hidden>
        <div className='input-group-text' id='btnGroupAddon'>1-6 of 6</div>
      </div>
      <button type='button' className='btn btn-light btn-sm' disabled>1-6 of 6</button>
      <button type='button' className='btn btn-light btn-sm'>&lt;</button>
      <button type='button' className='btn btn-light btn-sm'>&gt;</button>
    </div>
  </div>

/**
 *
 * @param {ToolbarConfig} config
 * @return {JSX.Element}
 */
const Toolbar = ({ config, children }) =>
  <div className='row'>
    <div className='col-8'>
      <div className='btn-toolbar mb-3' role='toolbar' aria-label='Toolbar with button groups'>
        <div className='btn-group mr-2' role='group' aria-label='First group'>
          {config.buttons.map((x, i) =>
            <ToolbarButton key={i} {...x} />)}
        </div>
        {config.search.visible && <SearchBox onSubmit={config.search.handleSubmit} />}
        {children}
      </div>
    </div>
    {config.pagination.visible && <Pagination {...config.pagination} />}
  </div>

export default Toolbar
