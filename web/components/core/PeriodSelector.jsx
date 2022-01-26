'use strict'

import React from 'react'
import DropdownButton from './DropdownButton'
import classNames from 'classnames'
import { rootStore } from '../../stores/rootStore.js'

const currentYear = (new Date().getFullYear()).toString()

/**
 * Period drop-down selector.
 * @param {string} selectedYear
 * @param {string} selectedMonth
 * @param {function} handleChange
 * @param {?boolean} hideAllMonthOption
 * @return {JSX.Element}
 * @constructor
 */
const PeriodSelector = ({ selectedYear, selectedMonth, handleChange, hideAllMonthOption }) => {
  if (!rootStore.masterDataStore.years) return null

  const years =  rootStore.masterDataStore.years.map(x => ({id: x.toString(), label: x.toString()}))
  const months = [
    {id: 'all', label: 'All months'},
    {id: '01', label: 'Jan'},
    {id: '02', label: 'Feb'},
    {id: '03', label: 'Mar'},
    {id: '04', label: 'Apr'},
    {id: '05', label: 'May'},
    {id: '06', label: 'Jun'},
    {id: '07', label: 'Jul'},
    {id: '08', label: 'Aug'},
    {id: '09', label: 'Sep'},
    {id: '10', label: 'Oct'},
    {id: '11', label: 'Nov'},
    {id: '12', label: 'Dec'}
  ]
  const thisYearIndex = years.findIndex(x => x.id === currentYear)
  years[thisYearIndex].label = 'This year'
  if (hideAllMonthOption) months.shift()

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
