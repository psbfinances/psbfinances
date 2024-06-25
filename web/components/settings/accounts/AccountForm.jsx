'use strict'

import React from 'react'
import AmountField from '../../core/AmountField.jsx'
import InputField  from '../../core/InputField.jsx'
import SelectField from '../../core/SelectField.jsx'
import CheckboxField from '../../core/CheckboxField.jsx'
import { NoteField } from '../../core/NoteField.jsx'
import { BalanceCalculator } from './BalanceCalculator.jsx'
import CancelOkButtons from '../../core/CancelOkButtons.jsx'
import { accountsViewModel } from './accountsViewModel.js'
import utils from '@psbfinances/shared/core/utils.js'

const typeOptions = [
  { value: 'Banking', label: 'Banking' },
  { value: 'Saving', label: 'Saving' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Investment', label: 'Investment' },
  { value: 'Loan', label: 'Loan' }
]

/**
 * Account form.
 * @constructor
 */
export class AccountForm extends React.Component {
  /**
   *
   * @type {{editItem?: FinancialAccount, balanceCalculatorVisible: boolean, errors: {}}}
   */
  state = {
    editItem: null,
    balanceCalculatorVisible: false,
    errors: {}
  }

  /**
   *
   * @param {Object} props
   * @param {FinancialAccount} props.selectedItem
   */
  constructor (props) {
    super(props)
    this.state.editItem = props.selectedItem ? { ...props.selectedItem } : null
  }

  static getDerivedStateFromProps (props, state) {
    if (!props.selectedItem) return null

    if (state.editItem && state.editItem.id === props.selectedItem.id) return state

    return { editItem: { ...props.selectedItem } }
  }

  /**
   *
   * @param {{target: HTMLInputElement}} e
   */
  handleChange = e => {
    const editItem = accountsViewModel.handleChange(e.target, this.state.editItem)
    this.setState({ editItem })
  }

  handleAmountChange = value => this.setState(
    { editIetm: Object.assign(this.state.editItem, { openingBalance: value }) })

  handleSaveClick = async e => {
    const { selectedId, errors } = await accountsViewModel.save(this.state.editItem)
    if (!utils.hasError(errors)) await this.props.handleSave(selectedId)

    this.setState({ errors })
  }

  handleCancelClick = e => this.setState({ editItem: { ...this.props.selectedItem }, errors: {} })

  handleBalanceCalculatorCalculateClick = async currentBalance => {
    const openingBalance = await accountsViewModel.calculateOpeningBalance(currentBalance)
    this.setState({ balanceCalculatorVisible: false, editItem: { ...this.state.editItem, openingBalance } })
  }

  handleBalanceCalculatorVisibility = () => {
    this.setState({ balanceCalculatorVisible: !this.state.balanceCalculatorVisible })
  }

  render () {
    if (!this.props.selectedItem) return null
    const isNew = utils.isNewId(this.state.editItem.id)

    return <div>
      <div id='dataContainer' className='frm formDataContainer'>
        <div id='formContainer' data-testid='formContainer' className='formContainer'>

          <InputField
            label='Short name' id='shortName' handleChange={this.handleChange}
            value={this.state.editItem.shortName} />
          <InputField
            label='Long name' id='fullName' handleChange={this.handleChange}
            value={this.state.editItem.fullName} />
          <SelectField
            id='type' label='Account type' value={this.state.editItem.type} options={typeOptions}
            handler={this.handleChange} />
          <div className='mb-3'>
            <label htmlFor='inputOpeningBalance' className='form-label'>Opening balance</label>
            <AmountField fieldAmount={this.state.editItem.openingBalance} setValue={this.handleAmountChange} />
          </div>

          <BalanceCalculator
            handleVisibility={this.handleBalanceCalculatorVisibility}
            handleCalculateClick={this.handleBalanceCalculatorCalculateClick}
            isNew={isNew}
            visible={this.state.balanceCalculatorVisible}
            balance={this.state.editItem.balance} />

          <CheckboxField
            id='isDefault' label='Default account' value={this.state.editItem.isDefault}
            errors={this.state.errors} handleChange={this.handleChange} />
          <CheckboxField
            id='scheduledEnabled' name='meta.scheduledEnabled' label='Enable scheduled transactions'
            value={Boolean(this.state.editItem.meta && this.state.editItem.meta.scheduledEnabled)}
            errors={this.state.errors} handleChange={this.handleChange} />
          <CheckboxField
            id='closed' label='Closed account' value={this.state.editItem.closed}
            errors={this.state.errors} handleChange={this.handleChange} />
          <CheckboxField
            id='visible' label='Show this account' value={this.state.editItem.visible}
            errors={this.state.errors} handleChange={this.handleChange} />

          <NoteField id='note' label='Note' value={this.state.editItem.note || ''} handleChange={this.handleChange} />

          {this.state.errors && this.state.errors.formError && <div>this.state.errors.formError</div>}

          {!this.state.balanceCalculatorVisible && <CancelOkButtons okLabel='Save' onOkClick={this.handleSaveClick}
                                                                    onCancelClick={this.handleCancelClick} />}
        </div>
      </div>
    </div>
  }
}
