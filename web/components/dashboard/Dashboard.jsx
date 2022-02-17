'use strict'

import React, { useEffect, useState } from 'react'
import * as api from '../../../shared/apiClient/index.js'
import './dashboard.css'
import { rootStore } from '../../stores/rootStore.js'
import DashboardToolbar from './DashboardToolbar.jsx'
import DashboardPersonalTab from './DashboardPersonalTab.jsx'
import DashboardBusinessTab from './DashboardBusinessTab.jsx'
import { observer } from 'mobx-react'
import { makeAutoObservable } from 'mobx'
import { c } from '@psbfinances/shared/core/index.js'

/**
 * Dashboard component model.
 * @class
 * @property {boolean} hasData
 * @property {Object} data
 * @property {string} period
 * @property {string} year
 * @property {Object[]} businesses
 * @property {Object} selectedBusiness
 * @property {boolean} showReconciledOnly
 */
class DashboardModel {
  hasData = false
  data = {}
  period = `${(new Date()).getMonth() + 1}`.padStart(2, '0')
  year = (new Date()).getFullYear().toString()
  businesses
  selectedBusiness
  showReconciledOnly = true

  constructor () {
    makeAutoObservable(this)
  }

  get hasBusinesses () {
    return rootStore.masterDataStore.hasBusinesses
  }

  get isBusinessSelected () {
    return this.selectedBusiness && this.selectedBusiness.id !== c.PERSONAL_TYPE_ID
  }

  getData = async () => {
    if (!this.businesses) {
      await rootStore.masterDataStore.getData()
      this.businesses = rootStore.masterDataStore.businessOptions.map(x => ({ id: x.value, ...x }))
      this.businesses.shift()
    }
    if (!this.selectedBusiness) this.selectedBusiness = this.businesses[0]
    const response = await api.dashboardApi.get(this.period, this.year, this.selectedBusiness.id,
      this.showReconciledOnly)
    this.data = response.data
    this.hasData = true
  }

  handleFilterChange = async ({ year, month }) => {
    if (year) this.year = year
    if (month) this.month = month
    await this.getData()
  }

  handlePeriodChange = async e => {
    if (e.target.name === 'monthSelect') {
      this.period = e.target.id
    } else {
      this.year = e.target.id
    }
    await this.getData()
  }

  handleBusinessChange = async e => {
    this.selectedBusiness = this.businesses.find(x => x.id === e.target.id)
    await this.getData()
  }

  handleShowReconciledOnlyChange = async e => {
    this.showReconciledOnly = e
    await this.getData()
  }
}

/**
 * Dashboard component.
 * @return {JSX.Element|null}
 * @constructor
 */
let Dashboard = () => {
  const [model] = useState(new DashboardModel())

  useEffect(async () => {
    await model.getData()
  }, [])

  if (!model.hasData) return null

  return <div className='dashboardDataContainer'>
    <DashboardToolbar model={model} />
    {model.isBusinessSelected ? <DashboardBusinessTab model={model} /> : <DashboardPersonalTab model={model} />}
  </div>
}
Dashboard = observer(Dashboard)
export default Dashboard

/** @module psbf/web/components/dashboard **/
/**
 * @typedef {Object} DashboardFilter
 * @property {string} year
 * @property {string} month
 * @property {string} businessId
 * */

