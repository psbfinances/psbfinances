'use strict'

import React, { useEffect, useState } from 'react'
import DropdownButton from '../core/DropdownButton.jsx'
import classNames from 'classnames'
import { PeriodSelector, SettingsButton, SettingsContainer } from '../core/index.js'
import Switch from 'react-switch'
import { observer } from 'mobx-react'
import { useSearchParams } from 'react-router-dom'

/**
 * @link module:psbf/web/components/dashboard
 */

/**
 * Dashboard toolbar.
 * @param {DashboardModel} model
 * @return {JSX.Element}
 * @constructor
 */
let DashboardToolbar = ({ model }) => {
  const [settingsVisible, setSettingsVisible] = useState(false)
  let [searchParams, setSearchParams] = useSearchParams()

  const handleSettingsClick = () => setSettingsVisible(true)

  useEffect(async () => {
    const filter = getFilter(searchParams)
    setUrl(filter)
    model.year = filter.year
    model.month = filter.month
    model.period = filter.month
    model.selectedBusiness = model.businesses.find(x => x.id === filter.businessId)
    await model.getData()
  }, [searchParams])

  /**
   * @param {DashboardFilter} filter
   */
  const setUrl = filter => {
    setSearchParams(filter)
  }
  /**
   * @param {URLSearchParams} searchParams
   * @return {DashboardFilter}
   */
  const getFilter = (searchParams) => {
    const year = searchParams.has('year') ? searchParams.get('year') : model.year
    const month = searchParams.has('month') ? searchParams.get('month') : model.period
    const businessId = searchParams.has('businessId') ? searchParams.get('businessId') : model.selectedBusiness.id

    return { year, month, businessId }
  }

  const handlePeriodChange = async e => {
    if (e.target.name === 'monthSelect') {
      setSearchParams({ month: e.target.id })
    } else {
      setSearchParams({ year: e.target.id })
    }

    await model.handlePeriodChange(e)
  }

  const handleBusinessChange = async e => {
    setSearchParams({ businessId: e.target.id })
    await model.handleBusinessChange(e)
  }

  const handleSettingsCloseClick = () => setSettingsVisible(false)

  // noinspection RequiredAttributes
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
          options={{ hideAllMonth: true }}
          hideAllMonthOption={true}
          selectedYear={model.year}
          selectedMonth={model.period}
          handleChange={handlePeriodChange} />
        <BusinessSelector
          hasBusinesses={model.hasBusinesses}
          businesses={model.businesses}
          selectedBusiness={model.selectedBusiness}
          handleChange={handleBusinessChange} />
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
        selectedId={selectedBusiness.id}
        labelName='label' />
      <ul className='dropdown-menu' aria-label='businessSelect'>
        {businesses.map(x => <li key={`b-${x.id}`}>
          <a
            id={x.id}
            className={classNames('dropdown-item', { 'active': x.id === selectedBusiness.id })}
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
