'use strict'

import React, { useState } from 'react'
import { CategorySelector, PeriodSelector } from '../core/index.js'
import { rootStore } from '../../stores/rootStore.js'
import { c } from '@psbfinances/shared/core/index.js'
import classNames from 'classnames'

const ModalButton = ({ label, handleClick = () => {} }) => <button type='button'
                                                                  className='btn btn-outline-secondary'
                                                                  onClick={handleClick}
                                                                  data-bs-dismiss='modal'>{label}</button>

/**
 * @typedef {object} TransactionsFilter
 * @property {boolean} duplicatesOnly
 * @property {boolean} newOnly
 * @property {string} year
 * @property {string} month
 * @property {string} category
 */
export const FilterModal = ({ model }) => {
  const [duplicatesOnly, setDuplicatesOnly] = useState(false)
  const [newOnly, setNewOnly] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [month, setMonth] = useState(c.selectId.ALL)
  const [category, setCategory] = useState(c.selectId.ALL)

  const resetFilter = () => {
    setDuplicatesOnly(false)
    setNewOnly(false)
    setYear(new Date().getFullYear().toString())
    setMonth(c.selectId.ALL)
    setCategory(c.selectId.ALL)
  }

  const handleDuplicatesClick = async () => {
    const newValue = !duplicatesOnly
    resetFilter()
    setDuplicatesOnly(newValue)
    if (newValue) await model.setDuplicatesOnly()
    else await model.resetFilter()
  }

  const handleNewClick = () => {
    resetFilter()
    setNewOnly(true)
    model.setNewOnly()
  }

  const handlePeriodChange = async e => {
    resetFilter()
    if (e.target.name === 'yearSelect') setYear(e.target.id)
    else setMonth(e.target.id)
    await model.setPeriod(e.target.name, e.target.id)
  }

  const handleCategoryChange = async e => {
    resetFilter()
    setCategory(e.target.id)
    await model.setCategory(e.target.id)
  }

  const handleClearAll = async () => {
    resetFilter()
    await model.resetFilter()
  }

  return <div data-bs-backdrop='static'
              data-bs-keyboard='false'
              className='modal fade'
              id='filterModal'
              tabIndex='-1'
              aria-labelledby='exampleModalLabel'
              aria-hidden='true'>
    <div className='modal-dialog'>
      <div className='modal-content'>
        <div className='modal-header'>
          <h5 className='modal-title' id='exampleModalLabel'>Filter</h5>
          <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
        </div>
        <div className='modal-body'>
          <div>Quick filter</div>
          <div className='d-grid gap-2 d-md-block mt-2'>
            <button
              type='button'
              data-bs-toggle='button'
              className={classNames('btn btn-outline-primary', { active: duplicatesOnly })}
              onClick={handleDuplicatesClick}>Duplicates
            </button>
            <button
              type='button'
              data-bs-toggle='button'
              className={classNames('btn btn-outline-primary ms-2', { active: newOnly })}
              onClick={handleNewClick}>New only
            </button>
          </div>

          <div className='mt-3'>Dates</div>
          <div className='row row-cols-md-auto g-3 align-items-center'>
            <PeriodSelector
              selectedYear={year}
              selectedMonth={month}
              handleChange={handlePeriodChange}
            />
          </div>

          <div className='mt-3'>Category</div>
          <div className='row-cols-md-auto g-3 align-items-center'>
            <CategorySelector
              items={[...rootStore.masterDataStore.categories.values()]}
              selectedId={category}
              handleChange={handleCategoryChange}
            />
          </div>
        </div>
        <div className='modal-footer'>
          <ModalButton label='Close' />
          <ModalButton label='Clear all' handleClick={handleClearAll} />
        </div>
      </div>
    </div>
  </div>
}
