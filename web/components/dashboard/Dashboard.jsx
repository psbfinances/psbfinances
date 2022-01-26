'use strict'

import React from 'react'
import * as api from '../../../shared/apiClient/index.js'
import './dashboard.css'
import { rootStore } from '../../stores/rootStore.js'
import DashboardToolbar from './DashboardToolbar.jsx'
import DashboardPersonalTab from './DashboardPersonalTab.jsx'
import DashboardBusinessTab from './DashboardBusinessTab.jsx'

/**
 *
 */
export default class Dashboard extends React.Component {
  /**
   * @type {Object} state
   * @property {boolean} hasData
   */
  state = {
    hasData: false,
    data: {},
    period: `${(new Date()).getMonth() + 1}`.padStart(2, '0'),
    year: (new Date()).getFullYear().toString()
  }

  constructor (props) {
    super(props)
  }

  async getData () {
    await rootStore.masterDataStore.getData()
    const businesses = rootStore.masterDataStore.businessOptions.map(x => ({ id: x.value, ...x }))
    businesses.shift()
    const selectedBusiness = businesses[0]
    const data = await api.dashboardApi.get(this.state.period, this.state.year, selectedBusiness.id)
    this.setState({
      data: data.data,
      hasData: true,
      businesses,
      selectedBusiness,
      hasBusinesses: rootStore.masterDataStore.hasBusinesses
    })
  }

  componentDidMount () {
    this.getData().then()
  }

  handlePeriodChange = async e => {
    e.preventDefault()
    if (e.target.name === 'monthSelect') {
      const period = e.target.id
      const data = await api.dashboardApi.get(period, this.state.year, this.state.selectedBusiness.id)
      this.setState({ period, data: data.data, hasData: true })

    } else {
      const year = e.target.id
      const data = await api.dashboardApi.get(this.state.period, year, this.state.selectedBusiness.id)
      this.setState({ year, data: data.data, hasData: true })
    }
  }

  handleYearChange = async e => {
    const year = e.target.id
    const data = await api.dashboardApi.get(this.state.period, year, this.state.selectedBusiness.id)
    this.setState({ year, data: data.data, hasData: true })
  }

  handleBusinessChange = async e => {
    e.preventDefault()
    const selectedBusiness = this.state.businesses.find(x => x.id === e.target.id)
    const data = await api.dashboardApi.get(this.state.period, this.state.year, selectedBusiness.id)
    this.setState({ selectedBusiness, data: data.data, hasData: true })
  }

  render () {
    if (!this.state.hasData) return null

    return <div className='dashboardDataContainer'>
      <DashboardToolbar
        hasBusinesses={this.state.hasBusinesses}
        businesses={this.state.businesses}
        selectedPeriod={this.state.period}
        selectedYear={this.state.year}
        selectedBusiness={this.state.selectedBusiness}
        handleBusinessChange={this.handleBusinessChange}
        handleYearChange={this.handleYearChange}
        handlePeriodChange={this.handlePeriodChange} />
      {this.state.selectedBusiness.id === 'p'
        ? <DashboardPersonalTab
          accounts={this.state.data.accounts}
          categories={this.state.data.budget}
          categoriesYear={this.state.data.budgetYear}
          tasks={this.state.data.tasks}
          transactions={this.state.data.transactions} />
        : <DashboardBusinessTab
          pl={this.state.data.pl}
          businessId={this.state.selectedBusiness.id}
          categoriesYear={this.state.data.businessPLCurrentYear}
          categories={this.state.data.businessPLCurrentMonth} />
      }
    </div>
  }
}

