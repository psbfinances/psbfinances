'use strict'

import React from 'react'
import classNames from 'classnames'
import { AmountField } from '../../core'
import { observer } from 'mobx-react'

/**
 * Account form.
 * @param {AccountListModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
let AccountForm = ({ model }) => {
  if (!model.editItem) return null

  return <div>
    <div id='dataContainer' className='frm formDataContainer'>
      <div id='formContainer' data-testid='formContainer' className='formContainer'>

        <div className='mb-3'>
          <label htmlFor='inputShortName' className='form-label'>Short name</label>
          <input
            name='shortName'
            className={classNames(['form-control', { 'is-invalid': model.formErrors.shortName }])}
            id='inputShortName'
            value={model.editItem ? model.editItem.shortName : ''}
            onChange={model.handleChange} />
          <div className='invalid-feedback'>
            Please enter a short name.
          </div>
        </div>
        <div className='mb-3'>
          <label htmlFor='inputFullName' className='form-label'>Full name</label>
          <input
            name='fullName'
            className={classNames(['form-control', { 'is-invalid': model.formErrors.fullName }])}
            id='inputFullName'
            value={model.editItem ? model.editItem.fullName : ''}
            onChange={model.handleChange} />
          <div className='invalid-feedback'>
            Please enter a full name.
          </div>
        </div>
        <div className='mb-3'>
          <label htmlFor='inputType' className='form-label'>Account type</label>
          <select
            id='type'
            name='type'
            className='form-select'
            onChange={model.handleChange}
            value={model.editItem.type}>
            <option value='checking'>Checking account</option>
            <option value='saving'>Saving account</option>
            <option value='CC'>Credit card</option>
            <option value='cash'>Cash</option>
          </select>
        </div>
        <div className='mb-3'>
          <label htmlFor='inputOpeningBalance' className='form-label'>Opening balance</label>
          <AmountField fieldAmount={model.editItem.openingBalance} setValue={model.handleAmountChange} />
        </div>
        <div className='form-check mb-3'>
          <input
            name='isDefault'
            className='form-check-input'
            type='checkbox'
            id='isDefault'
            checked={Boolean(model.editItem.isDefault)}
            onChange={model.handleChange} />
          <label className='form-check-label' htmlFor='isDefault'>
            Default account
          </label>
        </div>
        <div className='form-check mb-3'>
          <input
            name='meta.scheduledEnabled'
            className='form-check-input'
            type='checkbox'
            id='scheduledEnabled'
            checked={Boolean(model.editItem.meta && model.editItem.meta.scheduledEnabled)}
            onChange={model.handleChange} />
          <label className='form-check-label' htmlFor='scheduledEnabled'>
            Enable scheduled transactions
          </label>
        </div>
        <div className='form-check mb-3'>
          <input
            name='closed'
            className='form-check-input'
            type='checkbox'
            id='closed'
            checked={Boolean(model.editItem.closed)}
            onChange={model.handleChange} />
          <label className='form-check-label' htmlFor='closed'>
            Closed account
          </label>
        </div>
        <div className='form-check mb-3'>
          <input
            name='visible'
            className='form-check-input'
            type='checkbox'
            id='visible'
            checked={Boolean(model.editItem.visible)}
            onChange={model.handleChange} />
          <label className='form-check-label' htmlFor='visible'>
            Show this account
          </label>
        </div>
        <div className='form-group'>
          <label htmlFor='note' className='form-label'>Note</label>
          <textarea
            id='note'
            name='note'
            data-testid='note'
            rows={3}
            className='form-control'
            placeholder='Notes'
            onChange={model.handleChange}
            value={model.editItem.note || ''} />
        </div>


        <div className='col-form-label-sm'>
          <div className='mt-4 mb-3'>
            <div className='form-group mb-3'>
              <button onClick={model.save} className='btn btn-primary'>
                Save
              </button>
              <button onClick={model.undoEdit} className='btn btn-outline-danger ms-2'>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
}
AccountForm = observer(AccountForm)

export default AccountForm
