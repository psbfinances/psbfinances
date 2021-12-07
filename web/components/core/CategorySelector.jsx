'use strict'

import React from 'react'
import DropdownButton from './DropdownButton.jsx'
import classNames from 'classnames'
import { c } from '../../../shared/core/index.js'
import { render } from 'react-dom'

const allCategoriesOption = {
  id: c.selectId.ALL,
  label: 'All categories'
}

/**
 *
 */
class CategorySelector extends React.Component {
  options

  /**
   *
   * @param {Object} props
   * @param {psbf.Category[]} props.items
   * @param {string} props.selectedId
   * @param {function} props.handleChange
   */
  constructor (props) {
    super(props)
    let prevType = 1
    this.options = [allCategoriesOption]
    for (const item of props.items) {
      if (prevType !== item.isPersonal) {
        this.options.push({ id: 'divider', label: '' })
      }
      this.options.push({ id: item.id, label: item.name })
      prevType = item.isPersonal
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.selectedId !== nextProps.selectedId
  }

  render () {
    return <>
      <DropdownButton id='categorySelect' items={this.options} selectedId={this.props.selectedId} labelName='label' />
      <ul className='dropdown-menu scrollable-menu' aria-label='categorySelect'>
        {this.options.map(x => x.id !== 'divider'
          ? <li key={x.id}>
            <a
              id={x.id}
              className={classNames('dropdown-item', { 'active': x.id === this.props.selectedId })}
              href='#'
              name='categorySelect'
              onClick={this.props.handleChange}>{x.label}</a>
          </li>
          : <li key={Math.random()}>
            <hr className='dropdown-divider' />
          </li>)}
      </ul>
    </>
  }
}

/**
 * Categories drop-down selector.
 * @param {Category[]} items
 * @param {string} selectedId
 * @param {function} handleChange
 * @return {JSX.Element}
 * @constructor
 */
const CategorySelector1 = ({ items, selectedId, handleChange }) => {
  let prevType = 1
  let options = [allCategoriesOption]
  for (const item of items) {
    if (prevType !== item.isPersonal) {
      options.push({ id: 'divider', label: '' })
    }
    options.push({ id: item.id, label: item.name })
    prevType = item.isPersonal
  }

  return <>
    <DropdownButton id='categorySelect' items={options} selectedId={selectedId} labelName='label' />
    <ul className='dropdown-menu scrollable-menu' aria-label='categorySelect'>
      {options.map(x => x.id !== 'divider'
        ? <li key={x.id}>
          <a
            id={x.id}
            className={classNames('dropdown-item', { 'active': x.id === selectedId })}
            href='#'
            name='categorySelect'
            onClick={handleChange}>{x.label}</a>
        </li>
        : <li key={Math.random()}>
          <hr className='dropdown-divider' />
        </li>)}
    </ul>
  </>
}
export default CategorySelector
