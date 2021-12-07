'use strict'
import React from 'react'
import CurrencyInput from 'react-currency-input-field'
import { observer } from 'mobx-react'
import { makeAutoObservable } from 'mobx'
import CoreFields, { CoreFieldsModel } from './CoreFields'
import {barId} from './TransactionFormToolbar.jsx'
import { transactionModel } from '../../../shared/models/index.js'
import { rootStore } from '../../stores/rootStore.js'
import { IconButton } from '../core'
import { utils } from '../../../shared/core/index.js'

export class SplitsModel {
  addButtonVisible = true

  constructor () {
    makeAutoObservable(this)
  }

  get parentTransaction () {
    return rootStore.transactionsStore.editItem
  }

  get childTransaction () {
    return rootStore.transactionsStore.childTransactions
  }

  /**
   * @return {number}
   */
  get splitAmount () {
    let total = 0
    rootStore.transactionsStore.childTransactions.forEach(x => (total = total + x.amount))
    return utils.roundAmount(total)
  }

  /**
   * @return {number}
   */
  get unallocatedAmount () {
    return utils.roundAmount(rootStore.transactionsStore.editItem.amount - this.splitAmount)
  }

  /**
   * @return {boolean}
   */
  get saveButtonEnabled () {
    return rootStore.transactionsStore.childTransactions.length >= 0 && this.unallocatedAmount === 0
  }

  add = () => {
    const transaction = transactionModel.getNewChild(this.parentTransaction, this.unallocatedAmount)
    rootStore.transactionsStore.childTransactions.push(transaction)
  }

  remove = e => {
    const id = e.target.name === 'deleteChild' ? e.target.id : e.target.parentNode.id
    const index = rootStore.transactionsStore.childTransactions.findIndex(x => x.id === id)
    rootStore.transactionsStore.childTransactions.splice(index, 1)
  }

  get undoButtonVisible () {
    return this.parentTransaction.hasChildren
  }

  * save () {
    yield rootStore.transactionsStore.saveSplits()
  }

  cancelEdit () {
    rootStore.transactionsStore.cancelEdit()
  }
}

/**
 * Splits view.
 */
const Splits = observer(
  class Splits extends React.Component {
    /** @type {SplitsModel} */ model

    /**
     * @param {Object} props
     * @param {FormModel} props.formModel
     */
    constructor (props) {
      super(props)
      this.model = new SplitsModel()
    }

    isSplitViewSelected () {
      return this.props.formModel.toolBarId === barId.SPLIT
    }

    undo = async () => {
      await rootStore.transactionsStore.undoSplit()
      this.props.formModel.toolBarId = barId.DETAILS
    }

    render () {
      if (!this.isSplitViewSelected()) return null

      const model = this.model
      return <>
        <Amount name='transactionAmount' value={model.parentTransaction.amount} label='Transaction' />
        <Amount name='splitAmount' value={model.splitAmount} label='Split' />
        <Amount name='unallocatedAmount' value={model.unallocatedAmount} label='Unallocated' />
        <hr />
        <SplitList model={model} />

        <div className='mt-4 mb-3'>
          <button
            name='saveSplits'
            onClick={model.save}
            disabled={!model.saveButtonEnabled}
            className='btn btn-primary'>
            Save
          </button>
          <button name='cancelSplits' onClick={model.cancelEdit} className='btn btn-outline-primary ms-2'>
            Cancel
          </button>
          <IconButton
            label='addSplit' name='addSplit' icon='fas fa-plus-square' hidden={!model.addButtonVisible}
            handleClick={model.add} />
          <IconButton
            label='undo' name='undoSplits' icon='fas fa-undo' hidden={!model.undoButtonVisible}
            handleClick={this.undo} />
        </div>
      </>
    }
  })

/**
 * @param {string} name
 * @param {number} value
 * @param {string} label
 * @return {JSX.Element}
 * @constructor
 */
let Amount = ({ name, value, label }) => {
  return <div className='form-group row form-row mb-1'>
    <label htmlFor={name} className='col-sm-6 col-form-label'>{label}</label>
    <div className='col-sm-6'>
      <CurrencyInput
        id={name}
        name={name}
        disabled
        className='form-control text-right'
        value={value}
        decimalScale={2}
        prefix='$'
        style={{ color: value < 0 ? 'red' : 'green' }}
      />
    </div>
  </div>
}
Amount = observer(Amount)

/**
 * @param {SplitsModel} model
 * @return {JSX.Element}
 * @constructor
 */
let SplitList = ({ model }) => {
  return <div data-testid='splitTransactionsDiv'>
    {rootStore.transactionsStore.childTransactions.map(x => {
      const coreModel = new CoreFieldsModel(x, false)
      return <SplitRow key={x.id} formModel={model} model={coreModel} />
    })}
  </div>
}
SplitList = observer(SplitList)

/**
 *
 * @param {SplitsModel} formModel
 * @param {CoreFieldsModel} model
 * @return {JSX.Element}
 * @constructor
 */
let SplitRow = ({ model, formModel }) => {
  return <div className='row border-bottom mb-3 pb-3'>
    <div className='col-sm-9'>
      <CoreFields model={model} />
    </div>
    <div className='col-sm-2 ps-4'>
      <button
        aria-label='delete child'
        id={model.transaction.id}
        name='deleteChild'
        onClick={formModel.remove}
        className='btn btn-danger'><i className='fas fa-trash-alt' />
      </button>
    </div>
  </div>
}
SplitRow = observer(SplitRow)
export default Splits
