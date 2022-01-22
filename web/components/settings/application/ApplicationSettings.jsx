'use strict'
import React, { useState } from 'react'
import * as api from '@psbfinances/shared/apiClient/index.js'

export default class ApplicationSettingsForm extends React.Component {
  /**
   * Adds demo data.
   * @return {Promise<void>}
   */
  addDemoData = async () => await api.applicationApi.postDemoData()

  /**
   * Deletes demo data.
   * @return {Promise<void>}
   */
  deleteDemoData = async () => api.applicationApi.deleteDemoData()

  render () {
    return <div id='dataContainer' className='dataContainer'>
      <div className='ms-4 mt-2 me-4 mb-2'>
        <h4>Danger Zone</h4>
        <div className='p-2 border border-danger rounded'>
          <DangerZoneItem
            handleOk={this.addDemoData}
            title='Add demo data'
            description='Add demo data for a quick start exploration. This will erase all existing data (transactions, categories, accounts, ...).'
            buttonLabel='Add data' />
          <DangerZoneItem
            handleOk={this.deleteDemoData}
            title='Remove demo data'
            description='Remove demo data. This will erase all existing data (transactions, categories, accounts, ...).'
            buttonLabel='Remove data' />
        </div>
      </div>
    </div>
  }
}

const DangerZoneItem = ({ title, description, buttonLabel, handleOk }) => {
  const [confirmationVisible, setConfirmationVisible] = useState(false)

  const toggleConfirmation = e => {
    e.preventDefault()
    setConfirmationVisible(!confirmationVisible)
  }

  const handleConformationSelection = async e => {
    toggleConfirmation(e)
    if (e.target.id === 'cancel') return Promise.resolve()

    await handleOk()
  }

  return <div className='row justify-content-md-center1 border-bottom pb-4 pt-4'>
    <div className='offset-md-2 col-7 justify-content-md-start'>
      <div className='fw-bold'>{title}</div>
      <div>
        {description}
      </div>
    </div>
    <div className='col-md-auto'>
      {!confirmationVisible && <button className='btn btn-danger' onClick={toggleConfirmation}>{buttonLabel}</button>}
      {confirmationVisible && <Confirmation handleConfirmation={handleConformationSelection}/>}
    </div>
  </div>
}

const Confirmation = ({handleConfirmation}) => {
  return <div>
    <div className='mb-1'>Are you sure?</div>
    <div>
      <button id='ok' className='btn btn-danger' onClick={handleConfirmation}>Yes</button>
      <button id='cancel' className='btn' onClick={handleConfirmation}>Cancel</button>
    </div>
  </div>
}
