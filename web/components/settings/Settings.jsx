'use strict'

import React from 'react'
import { Link } from 'react-router-dom'

export default function Settings () {
  return <div className='dataContainer' style={{ padding: '10px' }}>
    <div className='row'>
      <Card title='Application' text='Application settings' url='applicationSettings' />
      <Card title='Account' text='Setup your financial account' url='accounts' />
      <Card title='Users' text='Application users' url='users' />
      <Card title='Businesses' text='Setup your businesses' url='businesses' />
      <Card title='Categories' text='Setup transaction categories' url='categories' />
      <Card title='Cars' text='Cars used for business' url='cars' />
    </div>
    <div className='row mt-3'>
      <Card title='Imports' text='Import financial data' url='imports' />
      <Card title='Import Rules' text='Import formats and rules' url='importRules' />
      <Card title='Duplicate Transactions' text='Show transactions marked as duplicate' url='duplicateTransactions' />
    </div>
  </div>
}

const Card = ({ title, text, url }) => {
  return <div className='col-sm-3 mt-2'>
    <div className='card'>
      <div className='card-body'>
        <h5 className='card-title'>{title}</h5>
        <p className='card-text'>{text}</p>
        <Link to={url} className='btn btn-primary'>{title}</Link>
      </div>
    </div>
  </div>
}
