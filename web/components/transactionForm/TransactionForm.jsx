'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import { rootStore } from '../../stores/rootStore.js'
import { makeAutoObservable } from 'mobx'
import TransactionFormToolbar, { barId } from './TransactionFormToolbar'
import More from './More.jsx'
import { c } from '../../../shared/core/index.js'
import CoreFields, { CoreFieldsModel } from './CoreFields'
import TripEntry from './TripEntry'
import Splits from './Splits'
import Attachments from './Attachments'
import { transactionModel } from '../../../shared/models'

/**
 * Transaction form model.
 */
export class FormModel {
  toolBarId
  shouldLoadChildren
  errors
  hasErrors = false

  constructor () {
    makeAutoObservable(this)
    this.toolBarId = barId.DETAILS
    this.shouldLoadChildren = false
    this.errors = {}
  }

  setToolbarId (id = barId.DETAILS) {
    this.toolBarId = id
    if (this.toolBarId === barId.SPLIT) rootStore.transactionsStore.getChildTransactions()
  }

  setErrors (value) {
    this.errors = value
  }

  resetErrors () {
    this.errors = {}
  }

  get tripEntryVisible () {
    return !rootStore.transactionsStore.isNew && !this.isReadOnly
  }

  get hasDuplicateVisible () {
    return !rootStore.transactionsStore.isNew && !this.isManual &&
      rootStore.transactionsStore.editItem.duplicateCandidateId
  }

  get originalDescriptionVisible () {
    return !rootStore.transactionsStore.isNew && !this.isManual && rootStore.transactionsStore.editItem.originalDescription
  }

  get isManual () {
    return rootStore.transactionsStore.editItem && rootStore.transactionsStore.editItem.source === c.sources.MANUAL
  }

  get isReadOnly () {
    return Boolean(rootStore.transactionsStore.editItem && rootStore.transactionsStore.editItem.hasChildren)
  }

  get markAsDuplicateVisible () {
    return !rootStore.transactionsStore.isNew && !this.isManual && !this.isReadOnly
  }

  get cancelButtonVisible () {
    return true // TODO should enable undo for existing transactions? rootStore.transactionsStore.isNew || this.isManual
  }

  get deleteButtonVisible () {
    return !rootStore.transactionsStore.isNew && this.isManual && !this.isReadOnly
  }

  save = async () => {
    this.errors = {}
    const { valid, errors } = transactionModel.isValid(rootStore.transactionsStore.editItem)
    if (valid) {
      await rootStore.transactionsStore.save()
    } else {
      this.errors = errors
    }
  }
}

/**
 * Transaction form.
 * @param {FormModel} model
 */
let TransactionForm = ({model}) => {
  if (!rootStore.transactionsStore.editItem) return null
  if (rootStore.transactionsStore.isEmpty && !rootStore.transactionsStore.isNew) return null

  return <div id='dataContainer' className='frm formDataContainer'>
    <div id='formContainer' data-testid='formContainer' className='formContainer'>
      <TransactionFormToolbar model={model} />
      <DetailsView model={model} />
      <Splits formModel={model} />
      {model.toolBarId === barId.FILES &&
      <Attachments formModel={model} transactionId={rootStore.transactionsStore.editItem.id} />}
      {model.toolBarId === barId.MORE && <More formModel={model} />}
    </div>
  </div>
}
TransactionForm = observer(TransactionForm)

/**
 * @param {FormModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
let DetailsView = ({ model }) => {
  if (model.toolBarId !== 'details') return null

  const handleCancelEdit = () => {
    model.errors = {}
    rootStore.transactionsStore.cancelEdit()
  }

  const handleDelete = async () => rootStore.transactionsStore.delete()

  const coreFieldsModel = new CoreFieldsModel(rootStore.transactionsStore.editItem, model.isReadOnly, model.errors)
  return <div className='col-form-label-sm'>
    <CoreFields model={coreFieldsModel}>
      <TripEntry model={model} />
      <MarAsDuplicateField model={model} />
    </CoreFields>

    <div className='mt-4 mb-3'>
      <div className='form-group mb-3'>
        <button onClick={model.save} className='btn btn-primary'>
          Save
        </button>
        <button hidden={!model.cancelButtonVisible} onClick={handleCancelEdit} className='btn btn-outline-danger ms-2'>
          Cancel
        </button>
        <button hidden={!model.deleteButtonVisible} onClick={handleDelete} className='btn btn-danger ms-2'>
          Delete
        </button>
      </div>
    </div>

    <OriginalDescriptions model={model} />

  </div>
}
DetailsView = observer(DetailsView)

/**
 * @return {JSX.Element|null}
 * @constructor
 */
let MarAsDuplicateField = ({ model }) => {
  if (!model.markAsDuplicateVisible) return null

  const handleChange = () => {
    rootStore.transactionsStore.editItem.isDuplicate = !rootStore.transactionsStore.editItem.isDuplicate
  }

  const handleNotDuplicateClick = async () => {
    await rootStore.transactionsStore.setNotDuplicate()
  }

  return <div className='align-items-center bd-highlight d-flex flex-row justify-content-between mt-2'>
    <div className='form-group form-check float-start'>
      <input
        id='isDuplicate'
        name='isDuplicate'
        key='duplicateCheckbox'
        className='form-check-input'
        type='checkbox'
        onChange={handleChange}
        checked={rootStore.transactionsStore.editItem.isDuplicate} />
      <label className='form-check-label' htmlFor='isDuplicate'>
        Mark as duplicate
      </label>
    </div>
    {model.hasDuplicateVisible && <div className='float-end'>
      <button className='btn btn-link' onClick={handleNotDuplicateClick}>Not duplicate</button>
    </div>}

  </div>
}
MarAsDuplicateField = observer(MarAsDuplicateField)

/**
 *
 * @param {FormModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
let OriginalDescriptions = ({ model }) => {
  if (!model.originalDescriptionVisible) return null

  const transaction = rootStore.transactionsStore.selectedItem

  return <div className='form-group'>
    <span>Original Descriptions:</span><br />
    <span data-testid='originalDescription'>- {transaction.originalDescription}</span><br />
    <span data-testid='sourceOriginalDescription'>- {transaction.sourceOriginalDescription}</span>
  </div>
}
OriginalDescriptions = observer(OriginalDescriptions)

export default TransactionForm
