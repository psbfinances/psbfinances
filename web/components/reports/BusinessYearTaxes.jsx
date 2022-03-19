'use strict'

import React, { useEffect, useState } from 'react'
import { rootStore } from '../../stores/rootStore.js'
import * as api from '@psbfinances/shared/apiClient/index.js'

export const currencyFormatter = new Intl.NumberFormat('en-US',
  { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const BusinessYearTaxes = ({}) => {
  const [year, setYear] = useState((new Date()).getFullYear().toString())
  const [years, setYears] = useState(rootStore.masterDataStore.years)
  const [businessId, setBusinessId] = useState('')
  const [businesses, setBusinesses] = useState([])
  /** @type {[YearTaxResponse, function]} */
  const [data, setData] = useState({})

  useEffect(async () => {
    if (!years) {
      await rootStore.masterDataStore.getData()
      const y = rootStore.masterDataStore.years
      const businesses = rootStore.masterDataStore.businessOptions
      businesses.shift()
      businesses.shift()
      setBusinesses(businesses)
      setBusinessId(businesses[0].value)
      y.shift()
      setYears(y)
    }
    // setYear(rootStore.masterDataStore.years[0])
  }, [])

  const handleYearChange = e => setYear(e.target.value)

  const handleBusinessChange = e => setBusinessId(e.target.value)

  const handleRunReport = async () => {
    const response = await api.reportApi.getYearTaxes(year, businessId)
    setData(response.data)
  }

  if (!years) return null

  console.log({ year, businessId })

  return <div className='reportsContainer'>
    <div className='row'>
      <h4>Year Taxes Report</h4>
    </div>
    <div className='row'>
      <div className='col-6'>
        <form>
          <div className='form-group row'>
            <label htmlFor='year' className='col-sm-2 col-form-label'>Year:</label>
            <div className='col-sm-3'>
              <select
                id='year'
                name='year'
                className='form-select'
                onChange={handleYearChange}
                value={year}>
                {years.map(x => <option value={x} key={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <div className='form-group row mt-2'>
            <label htmlFor='business' className='col-sm-2 col-form-label'>Business:</label>
            <div className='col-sm-3'>
              <select
                id='business'
                name='business'
                className='form-select'
                onChange={handleBusinessChange}
                value={businessId}>
                {businesses.map(x => <option value={x.value} key={x.value}>{x.label}</option>)}
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div className='row mt-4 border-bottom pb-2'>
      <div className='col'>
        <button className='btn btn-primary' onClick={handleRunReport}>Run</button>
      </div>
    </div>
    <div className='row mt-4'>
      <div className='col'>
        <ReportData data={data} />
      </div>
    </div>
  </div>
}

const ReportLine = ({ label, value, isCurrency }) => {

  const formattedValue = isCurrency || isCurrency === undefined ? currencyFormatter.format(value) : value
  return <div className='row mt-2'>
    <div className='col-2 border-bottom'>{label}</div>
    <div className='col-1  border-bottom text-right'>{formattedValue}</div>
  </div>
}
/**
 *
 * @param {YearTaxResponse} data
 * @constructor
 */
const ReportData = ({ data }) => {
  if (!data.businessId) return null

  return <div>
    <h5 className='mt-2'>Totals</h5>

    <ReportLine label='Income' value={data.totalIncome} />
    <ReportLine label='Expense' value={data.totalExpenses} />
    <ReportLine label='Profit' value={data.profit} />
    <ReportLine label='Mileage' value={`${data.mileage || 0} mi`} isCurrency={false} />

    <h5 className='mt-2'>Income</h5>
    <Income data={data} />

    <h5 className='mt-2'>Expenses</h5>
    <Expenses data={data} />
  </div>
}

/**
 *
 * @param {YearTaxResponse} data
 * @constructor
 */
const Income = ({ data }) => {
  return data.income.map(x => <div key={x.categoryId}>
    <ReportLine label={x.categoryName} value={x.amount} />
  </div>)
}

/**
 *
 * @param {YearTaxResponse} data
 * @constructor
 */
const Expenses = ({ data }) => {
  return data.expenses.map(x => <div key={x.categoryId}>
    <ReportLine label={x.categoryName} value={x.amount} />
  </div>)
}

export default BusinessYearTaxes
