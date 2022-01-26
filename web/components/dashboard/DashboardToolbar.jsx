'use strict'

import React from 'react'
import DropdownButton from '../core/DropdownButton.jsx'
import classNames from 'classnames'
import { PeriodSelector } from '../core/index.js'

/**
 * Dashboard toolbar.
 * @return {JSX.Element}
 * @constructor
 */
const DashboardToolbar = ({
  selectedPeriod,
  selectedYear,
  handlePeriodChange,
  handleBusinessChange,
  hasBusinesses,
  businesses,
  selectedBusiness
}) => {
  return <div id='toolbar' className='pageToolbar'>
    <div>
      <div className='row row-cols-md-auto g-3 align-items-center'>
        <PeriodSelector
          hideAllMonthOption={true}
          selectedYear={selectedYear}
          selectedMonth={selectedPeriod}
          handleChange={handlePeriodChange} />
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

const BusinessSelector = ({ businesses, selectedBusiness, handleChange, hasBusinesses }) => {
  if (!hasBusinesses) return null

  return <>
    <div className='dropdown'>
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
