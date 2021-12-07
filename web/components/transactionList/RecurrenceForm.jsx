'use strict'

import React from 'react'
import { RRule, RRuleSet, rrulestr } from 'rrule'
import CurrencyInput from 'react-currency-input-field'

const labelColClass = 'col-sm-3 col-form-label'
const valueColClass = 'col-sm-9'

/**
 * Transaction recurrence entry.
 */
export default class RecurrenceForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      amount: props.transaction ? props.transaction.amount / 100 : 0,
      selectedRepeatOption: 'MONTHLY',
      numberOfRepeats: 999
    }
  }

  handleAmountChange = e => this.setState({ amount: e })

  handleRepeatChange = e => this.setState({ selectedRepeatOption: e.target.value })

  handleNumberOfRepeatsChange = e => this.setState({ numberOfRepeats: e.target.value })

  handleSubmit = async e => {
    e.preventDefault()
    const repeat = {
      transactionId: this.props.transaction.id,
      description: this.props.transaction.description,
      date: this.props.transaction.postedDate,
      amount: this.state.amount,
      endRepeat: this.state.numberOfRepeats,
      repeat: this.state.selectedRepeatOption
    }
    // console.log(repeat)
    // send to server
    // update showing list with new recurring transactions
    this.props.hideRepeat()
  }

  componentDidUpdate = (prevProps) => {
    if (!this.props.transaction) return

    if (this.props.transaction.id !== prevProps.transaction.id) {
      this.setState({ amount: this.props.transaction ? this.props.transaction.amount / 100 : 0 })
    }
  }

  handleCancelClick = e => {
    e.preventDefault()
    this.props.hideRepeat()
  }

  render () {
    // if (!this.props.visible) return null

    return <form className='col-form-label-sm' onSubmit={this.handleSubmit}>
      <AmountField amount={this.state.amount} handleAmountChange={this.handleAmountChange} />
      <RepeatField
        categoryId={this.state.selectedRepeatOption}
        handleRepeatChange={this.handleRepeatChange} />
      <EndRepeatInput
        numberOfRepeats={this.state.numberOfRepeats}
        handleNumberOfRepeatsChange={this.handleNumberOfRepeatsChange} />

      <div className='form-group'>
        <button type='submit' name='save' aria-label='saveRecurrence' className='btn btn-primary mb-3 btn-sm'>Save
        </button>
        <button name='cancelRecurrence' className='btn btn-link mb-3 btn-sm' onClick={this.handleCancelClick}>Cancel
        </button>
      </div>

    </form>
  }
}

const AmountField = ({ amount, handleAmountChange }) => <div className='form-group row'>
  <label htmlFor='recurrenceAmount' className={labelColClass}>Amount</label>
  <div className={valueColClass}>
    <CurrencyInput
      id='recurrenceAmount'
      className='form-control'
      name='recurrenceAmount'
      decimalsLimit={2}
      value={amount}
      prefix='$'
      style={{ color: amount < 0 ? 'red' : 'green' }}
      onValueChange={handleAmountChange}
    />
  </div>
</div>

const repeatOptions = [
  { id: 'MONTHLY', description: 'Every month' },
  { id: 'WEEKLY', description: 'Every week' },
  { id: 'YEARLY', description: 'Every year' },
  { id: 'n', description: 'Never' }
]
const RepeatField = ({ selectedRepeatOption, handleRepeatChange }) =>
  <div className='form-group row'>
    <label htmlFor='recurrenceRepeat' className={labelColClass}>Repeat</label>
    <div className={valueColClass}>
      <select
        className='custom-select my-1 mr-sm-2'
        id='recurrenceRepeat'
        name='recurrenceRepeat'
        onChange={handleRepeatChange}
        value={selectedRepeatOption}>
        {repeatOptions.map(x => <option value={x.id} key={x.id}>{x.description}</option>)}
      </select>
    </div>
  </div>

const EndRepeatInput = ({ numberOfRepeats, handleNumberOfRepeatsChange }) => <div className='form-group row'>
  <label htmlFor='recurrenceNumberOfRepeats' className={labelColClass}>End after</label>
  <div className={valueColClass}>
    <input
      id='recurrenceNumberOfRepeats'
      name='recurrenceNumberOfRepeats'
      onChange={handleNumberOfRepeatsChange}
      className='form-control'
      value={numberOfRepeats} />
  </div>
</div>

