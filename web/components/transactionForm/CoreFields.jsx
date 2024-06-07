'use strict'

import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import DatePicker from 'react-datepicker'
import DescriptionAutoComplete from './DescriptionAutoComplete'
import CurrencyInput from 'react-currency-input-field'
import 'react-bootstrap-typeahead/css/Typeahead.css'
import 'react-datepicker/dist/react-datepicker.css'
import { Error } from '../core/index.js'
import { makeAutoObservable } from 'mobx'
import { c } from '../../../shared/core/index.js'
import { rootStore } from '../../stores/rootStore'

const mb = 'mb-1'
const labelColClass = 'mb-1'
const fields = {
  postedDate: '',
  description: '',
  businessId: '',
  categoryId: '',
  amount: '',
  note: ''
}
Object.keys(fields).forEach(x => fields[x] = x)

export class CoreFieldsModel {
  /** @type {psbf.TransactionUI} */ transaction
  /** @type {SelectOption[]} */ businessOptions = []
  /** @type {CategoryOptions} */ categoryOptions
  /** @type {?string} */ note
  errors = {}
  readOnly = false

  /**
   * @param {psbf.TransactionUI} transaction
   * @param {boolean} readOnly
   * @param {Object} errors
   */
  constructor (transaction, readOnly = false, errors = {}) {
    // makeAutoObservable(this)
    this.transaction = transaction
    this.businessOptions = rootStore.masterDataStore.businessOptions
    this.categoryOptions = rootStore.masterDataStore.categoryOptions
    this.readOnly = readOnly
    this.errors = errors
  }

  setValues = (transaction, readOnly = false, rootStore, errors = {}) => {
    this.transaction = transaction
    this.businessOptions = rootStore.masterDataStore.businessOptions
    this.categoryOptions = rootStore.masterDataStore.categoryOptions
    this.readOnly = readOnly
    this.errors = errors

  }

  handleChange = e => {
    const target = e.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    this.transaction[name] = value
    this.errors = {}
  }

  get isManual () { return this.transaction && this.transaction.source === c.sources.MANUAL}

  get isChild () { return Boolean(this.transaction && this.transaction.parentId) }

  get labelsVisible () { return !this.isChild }

  get descriptionVisible () { return !this.isChild }

  get categoryDescription () {
    this.categoryOptions.categories.find(x => x.id === this.transaction.categoryId).name
  }

  get isNew () { return this.transaction && this.transaction.id.includes(c.NEW_ID_PREFIX) }

  get postedDateVisible () { return !this.isChild }

  get postedDateEnabled () { return this.isNew || this.isManual }

  get amountFieldEnabled () {
    return this.isNew || this.isManual
  }

  handleDescriptionChange = value => {
    if (this.errors.description) delete this.errors.description
    this.transaction.description = value ? value.description : ''
  }

  handlePostedDateChange = value => {
    if (this.errors.postedDate) delete this.errors.postedDate
    if (value) this.transaction.postedDate = value
  }
}

/**
 *
 * @param {CoreFieldsModel} model
 * @param {JSX.Element} children
 * @return {JSX.Element}
 * @constructor
 */
let CoreFields = ({ model, children }) => {
  return <>
    <PostedDateField model={model} />
    <DescriptionField model={model} />
    <BusinessField model={model} />
    <CategoryField model={model} />
    <AmountField model={model} />
    <NoteField model={model} handleChange={model.handleChange} />
    {children}
  </>
}

/**
 *
 * @param {CoreFieldsModel} model
 * @param {function} handleChange
 * @return {JSX.Element}
 * @constructor
 */
let PostedDateField = ({ model }) => {
  if (!model.postedDateVisible) return null

  return <div className={mb}>
    {model.labelsVisible && <label htmlFor={fields.postedDate} className='form-label'>Date</label>}
    <DatePicker
      id={fields.postedDate}
      dateFormat='MMMM d, yyyy'
      readOnly={!model.postedDateEnabled || model.readOnly}
      className='form-control w100'
      selected={new Date(model.transaction.postedDate)}
      onChange={model.handlePostedDateChange} />
    <Error errors={model.errors} fieldName={fields.postedDate} />
  </div>
}
PostedDateField = observer(PostedDateField)

/**
 * @param {CoreFieldsModel} model
 * @param {Function} handleChange
 * @return {JSX.Element}
 * @constructor
 */
let DescriptionField = ({ model }) => {
  if (!model.descriptionVisible) return null

  return <div className={mb}>
    {model.labelsVisible && <label htmlFor={fields.description} className={labelColClass}>Description</label>}
    <DescriptionAutoComplete
      handleChange={model.handleDescriptionChange}
      description={model.transaction.description} />
    <Error errors={model.errors} fieldName={fields.description} />
  </div>
}
DescriptionField = observer(DescriptionField)

/**
 * @param {CoreFieldsModel} model
 * @param {Function} handleChange
 * @return {JSX.Element}
 * @constructor
 */
let BusinessField = ({ model }) =>
  <div className={mb}>
    {model.labelsVisible && <label htmlFor={fields.businessId} className={labelColClass}>Type</label>}
    <div>
      <select
        id={fields.businessId}
        name={fields.businessId}
        className='form-select'
        disabled={model.readOnly}
        onChange={model.handleChange}
        value={model.transaction.businessId || c.selectId.NONE}>
        {model.businessOptions.map(
          (x, i) => <option value={x.value} key={`${model.transaction.id}-${i}`}>{x.label}</option>)}
      </select>
      <Error errors={model.errors} fieldName={fields.businessId} />
    </div>
  </div>
BusinessField = observer(BusinessField)

/**
 * @param {CoreFieldsModel} model
 * @param {Function} handleChange
 * @return {JSX.Element}
 * @constructor
 */
function CategoryField ({ model }) {
  const options = model.categoryOptions.getOptions(model.transaction.categoryId, model.transaction.businessId)
  return <div className={mb}>
    {model.labelsVisible && <label htmlFor={fields.categoryId} className={labelColClass}>Category</label>}
    <div>
      <select
        id={fields.categoryId}
        name={fields.categoryId}
        disabled={model.readOnly}
        className='form-select'
        onChange={model.handleChange}
        value={model.transaction.categoryId || c.selectId.NONE}>
        {options.map(x => <option value={x.value} key={x.value}>{x.label}</option>)}
      </select>
      <Error errors={model.errors} fieldName={fields.categoryId} />
    </div>
  </div>
}

CategoryField = observer(CategoryField)

/**
 * @param {CoreFieldsModel} model
 * @param {Function} handleChange
 */
export let AmountField = ({ model }) => {
  const [amount, setAmount] = useState(model.transaction.amount)

  const handleChange = value => {
    setAmount(value)
  }

  useEffect(() => {
    setAmount(model.transaction.amount)
  }, [model.transaction.amount])

  const handleBlur = e => {
    model.transaction.amount = e.target.value === '' ? 0 : parseFloat(e.target.value.replace('$', '').replace(',', ''))
  }

  return <div className={mb}>
    <label hidden={!model.labelsVisible} htmlFor={fields.amount} className={labelColClass}>Amount</label>
    <CurrencyInput
      id={fields.amount}
      name={fields.amount}
      aria-label={fields.amount}
      disabled={!model.amountFieldEnabled}
      className='form-control text-right'
      intlConfig={{ locale: 'en-US', currency: 'USD' }}
      value={amount}
      fixedDecimalLength={2}
      style={{ color: model.transaction.amount < 0 ? 'red' : 'green' }}
      onValueChange={handleChange}
      onBlur={handleBlur}
    />
    <Error errors={model.errors} fieldName={fields.amount} />
  </div>
}
AmountField = observer(AmountField)

/**
 * @param
  {CoreFieldsModel}
  model
 * @return
  {JSX.Element}
 * @constructor
 */
let NoteField = ({ model }) =>
  <div className='form-group'>
    {model.labelsVisible && <label htmlFor={fields.note} className={labelColClass}>Note</label>}
    <textarea
      id={fields.note}
      name={fields.note}
      data-testid={fields.note}
      rows={model.isChild ? 1 : 3}
      className='form-control'
      placeholder='Notes. Tags: #task, #rep-exclude'
      onChange={model.handleChange}
      value={model.transaction.note} />
    <Error errors={model.errors} fieldName={fields.note} />
  </div>
NoteField = observer(NoteField)

CoreFields = observer(CoreFields)
export default CoreFields
