'use strict'

import React from 'react'
import DropdownButton from './DropdownButton'
import classNames from 'classnames'

const currentYear = (new Date().getFullYear()).toString()
const years = [
  { id: '2022', label: '2022' },
  { id: '2021', label: '2021' },
  { id: '2020', label: '2020' },
  { id: '2019', label: '2019' },
  { id: '2018', label: '2018' },
  { id: '2017', label: '2017' },
  { id: '2016', label: '2016' },
  { id: '2015', label: '2015' },
  { id: '2014', label: '2014' },
  { id: '2013', label: '2013' }
]

const thisYearIndex = years.findIndex(x => x.id === currentYear)
years[thisYearIndex].label = 'This year'

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

/**
 * Period drop-down selector.
 * @param {string} selectedYear
 * @param {string} selectedMonth
 * @param {function} handleChange
 * @return {JSX.Element}
 * @constructor
 */
const PeriodSelector = ({ selectedYear, selectedMonth, handleChange }) => <>
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

export default PeriodSelector
