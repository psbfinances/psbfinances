'use strict'

import React, { useState } from 'react'
import DropdownButton from '../core/DropdownButton.jsx'
import classNames from 'classnames'
import { PeriodSelector, SettingsButton, SettingsContainer } from '../core/index.js'
import Switch from 'react-switch'
import { observer } from 'mobx-react'

/**
 * Dashboard toolbar.
 * @param {DashboardModel} model
 * @return {JSX.Element}
 * @constructor
 */
let DashboardToolbar = ({ model }) => {
  const [settingsVisible, setSettingsVisible] = useState(false)

  const handleSettingsClick = () => {
    setSettingsVisible(true)
  }

  const handleSettingsCloseClick = () => setSettingsVisible(false)

  return <div id='toolbar' className='pageToolbar'>
    <SettingsContainer
      header='Customize'
      visible={settingsVisible}
      handleCloseClick={handleSettingsCloseClick}>
      <div className='settingsGroup'>
        <label className='settingGroupLabel'>Show reconciled transactions only</label>
        <label className='settingsGroupValue'>
          <Switch
            onChange={model.handleShowReconciledOnlyChange}
            checked={model.showReconciledOnly}
            className='react-switch'
            checkedIcon={false}
            uncheckedIcon={false} />
        </label>
      </div>
    </SettingsContainer>

    <div>
      <div className='row row-cols-md-auto g-3 align-items-center'>
        <PeriodSelector
          hideAllMonthOption={true}
          selectedYear={model.year}
          selectedMonth={model.period}
          handleChange={model.handlePeriodChange} />
        <BusinessSelector
          hasBusinesses={model.hasBusinesses}
          businesses={model.businesses}
          selectedBusiness={model.selectedBusiness}
          handleChange={model.handleBusinessChange} />
        <SettingsButton handleClick={handleSettingsClick} />
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
DashboardToolbar = observer(DashboardToolbar)
export default DashboardToolbar
