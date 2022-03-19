'use strict'

import React from 'react'
import './reports.css'

const ReportList = ({}) => {
  return <div className='reportsContainer'>
    <div className='row'>
      <div className='col-sm-12 col-md-6 col-lg-6'>
        <h5>Personal</h5>
      </div>
      <div className='col-sm-12 col-md-6 col-lg-6'>
        <h5>Business</h5>
        <ul>
          <li><a href='reports/pl'>PL - Profit and Loss</a></li>
          <li><a href='reports/year-taxes'>Year taxes</a></li>
        </ul>
      </div>
    </div>
  </div>
}

export default ReportList

