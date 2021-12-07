'use strict'

import React from 'react'
import DropdownButton from '../core/DropdownButton.jsx'
import classNames from 'classnames'

/**
 * Dashboard toolbar.
 * @return {JSX.Element}
 * @constructor
 */
const DashboardToolbar = ({
  selectedPeriod,
  selectedYear,
  handlePeriodChange,
  handleYearChange,
  handleBusinessChange,
  hasBusinesses,
  businesses,
  selectedBusiness
}) => {
  return <div id='toolbar' className='pageToolbar'>
    <div>
      <div className='row row-cols-md-auto g-3 align-items-center'>
        <PeriodSelector
          selectedKey={selectedPeriod}
          handleChange={handlePeriodChange} />
        <YearSelector
          selectedKey={selectedYear}
          handleChange={handleYearChange} />
        <BusinessSelector
          hasBusinesses={hasBusinesses}
          businesses={businesses}
          selectedBusiness={selectedBusiness}
          handleChange={handleBusinessChange} />
      </div>
    </div>

    <div className='pageDataHeader' hidden>
      Dashboard
    </div>
  </div>
}

const periodOptions = [
  { id: '1', label: 'January' },
  { id: '2', label: 'February' },
  { id: '3', label: 'March' },
  { id: '4', label: 'April' },
  { id: '5', label: 'May' },
  { id: '6', label: 'June' },
  { id: '7', label: 'July' },
  { id: '8', label: 'August' },
  { id: '9', label: 'September' },
  { id: '10', label: 'October' },
  { id: '11', label: 'November' },
  { id: '12', label: 'December' },
]

const yearOptions = [
  { id: '2021', label: 'This year' },
  { id: '2020', label: '2020' },
  { id: '2019', label: '2019' },
  { id: '2018', label: '2018' }
]

const PeriodSelector = ({ selectedKey, handleChange }) => <>
  <div className='col dropdown mt-1'>
    <DropdownButton id='periodSelect' items={periodOptions} selectedId={selectedKey} labelName='label' />
    <ul className='dropdown-menu' aria-label='periodSelect'>
      {periodOptions.map(x => <li key={x.id}>
        <a
          id={x.id}
          className={classNames('dropdown-item', { 'active': x.id === selectedKey })}
          href='#'
          name='periodSelect'
          onClick={handleChange}>{x.label}</a>
      </li>)}
    </ul>
  </div>
</>

const YearSelector = ({ selectedKey, handleChange }) => <>
  <div className='col dropdown mt-1'>
    <DropdownButton id='yearSelect' items={yearOptions} selectedId={selectedKey} labelName='label' />
    <ul className='dropdown-menu' aria-label='yearSelect'>
      {yearOptions.map(x => <li key={x.id}>
        <a
          id={x.id}
          className={classNames('dropdown-item', { 'active': x.id === selectedKey })}
          href='#'
          name='yearSelect'
          onClick={handleChange}>{x.label}</a>
      </li>)}
    </ul>
  </div>
</>

const BusinessSelector = ({ businesses, selectedBusiness, handleChange, hasBusinesses }) => {
  if (!hasBusinesses) return null

  return <>
    <div className='dropdown col mt-1 ms-3' style={{ marginLeft: 'auto' }}>
      <DropdownButton
        id='businessSelect'
        items={businesses}
        selectedId={selectedBusiness.value}
        labelName='label' />
      <ul className='dropdown-menu' aria-label='businessSelect'>
        {businesses.map(x => <li key={x.value}>
          <a
            id={x.value}
            className={classNames('dropdown-item', { 'active': x.value === selectedBusiness.value })}
            href='#'
            name='businessSelect'
            onClick={handleChange}>{x.label}</a>
        </li>)}
      </ul>
    </div>
  </>
}

export default DashboardToolbar
