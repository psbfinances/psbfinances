'use strict'

import React, { useEffect, useState } from 'react'
import DropdownButton from './DropdownButton'
import classNames from 'classnames'
import { rootStore } from '../../stores/rootStore.js'

const currentYear = (new Date().getFullYear()).toString()
const allMonths = [
  { id: 'all', label: 'All months' },
  { id: '01', label: 'Jan' },
  { id: '02', label: 'Feb' },
  { id: '03', label: 'Mar' },
  { id: '04', label: 'Apr' },
  { id: '05', label: 'May' },
  { id: '06', label: 'Jun' },
  { id: '07', label: 'Jul' },
  { id: '08', label: 'Aug' },
  { id: '09', label: 'Sep' },
  { id: '10', label: 'Oct' },
  { id: '11', label: 'Nov' },
  { id: '12', label: 'Dec' }
]
/**
 * Period drop-down selector.
 * @param {string} selectedYear
 * @param {string} selectedMonth
 * @param {function} handleChange
 * @param {?boolean} hideAllMonthOption
 * @param {PeriodSelectorOptions} options
 * @return {JSX.Element}
 * @constructor
 */
const PeriodSelector = ({ selectedYear, selectedMonth, handleChange, options }) => {
  if (!rootStore.masterDataStore.years) return null
  let [years] = useState(rootStore.masterDataStore.years.map(x => ({ id: x.toString(), label: x.toString() })))
  let [months, setMonths] = useState(allMonths)
  let [thisYearIndex] = useState(0)

  useEffect(() => {
      setMonths(options && options.hideAllMonth ? allMonths.slice(1) : allMonths)
      thisYearIndex = years.findIndex(x => x.id === currentYear)
      years[thisYearIndex].label = 'This year'
    }, []
  )

  return <>
    <div className='dropdown'>
      <DropdownButton id='yearSelect' items={years} selectedId={selectedYear} labelName='label' />
      <ul className='dropdown-menu' aria-label='yearSelect'>
        {years.map(x => <li key={x.id}>
          <a
            id={x.id}
            className={classNames('dropdown-item', { 'active': x.id === selectedYear })}
            name='yearSelect'
            onClick={handleChange}>{x.label}</a>
        </li>)}
      </ul>
    </div>

    {Boolean(selectedMonth) && <div className='dropdown'>
      <DropdownButton id='monthSelect' items={months} selectedId={selectedMonth || 'all'} labelName='label' />
      <ul className='dropdown-menu' aria-label='monthSelect'>
        {months.map(x => <li key={x.id}>
          <a
            id={x.id}
            className={classNames('dropdown-item', { 'active': x.id === selectedMonth })}
            href='#'
            name='monthSelect'
            onClick={handleChange}>{x.label}</a>
        </li>)}
      </ul>
    </div>}
  </>
}

export default PeriodSelector

/**
 * @typedef {Object} PeriodSelectorOptions
 * @property {boolean} [hideAllMonth]
 */
