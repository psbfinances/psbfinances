'use strict'

import * as React from 'react'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'
import { amazonCardTransactions } from '../../__tests__/data.js'
import Splits from '../Splits.jsx'
import { FormModel } from '../TransactionForm.jsx'
import { rootStore } from '../../../stores/rootStore.js'
import { setupRootStore } from '../../__tests__/helper.js'

// jest.spyOn(console, 'log').mockImplementation()

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const formatAmount = amount => formatter.format(amount)

/** render */
describe('render', () => {
  it.todo('existing split : multiple tests')
  it.todo('new split : ')
  it.todo('change second amount + change first amount so that SUM = parentAmount')
  it.todo('delete row')
  it.todo('rename parent description, date - rename in children')
  it.todo('cannot edit parent business, category')
  it.todo('add row + delete row')
  it.todo('delete last row')
  it.todo('save disabled if any transaction is 0')
  it.todo(
    'add split + change amounts to match total + change business/category/note for each -> save - check what api was called with')
  it.todo('add row + change amount')
  // /** @type {SplitsModel} */ let model
  let parentTransaction = amazonCardTransactions[0]
  /** @type {HTMLInputElement} */ let transactionAmount
  /** @type {HTMLInputElement} */ let splitAmount
  /** @type {HTMLInputElement} */ let unallocatedAmount
  /** @type {HTMLDivElement} */ let splitRowsDiv
  /** @type {HTMLElement[]} */ let amountFields
  /** @type {HTMLButtonElement} */ let saveButton
  /** @type {HTMLButtonElement} */ let addButton

  /** @type {FormModel} */ let model

  const getFields = () => {
    transactionAmount = screen.getByLabelText('Transaction')
    splitAmount = screen.getByLabelText('Split')
    unallocatedAmount = screen.getByLabelText('Unallocated')
    splitRowsDiv = screen.getByTestId('splitTransactionsDiv')
    amountFields = within(splitRowsDiv).queryAllByLabelText('amount')
    saveButton = screen.queryByRole('button', { name: /save/i })
    addButton = screen.findByRole('button', { label: /add/i })
  }

  beforeAll(async () => {
    await setupRootStore()
  })

  beforeEach(() => {
    rootStore.transactionsStore.setItems(amazonCardTransactions, 0)

    parentTransaction = amazonCardTransactions[0]
    model = new FormModel()
    model.toolBarId = 'split'
  })

  it('add new row', async () => {
    rootStore.transactionsStore.getChildTransactions()
    render(<Splits formModel={model} />)
    getFields()

    const allButton = await screen.findAllByRole('button')
    addButton = allButton.find(x => x.name === 'addSplit')
    await userEvent.click(addButton)

    amountFields = await screen.findAllByLabelText('amount')
    expect(amountFields).toHaveLength(3)
  })


  it('renders view for new split', () => {
    rootStore.transactionsStore.getChildTransactions()
    render(<Splits formModel={model} />)
    getFields()

    expect(transactionAmount).toHaveValue(formatAmount(parentTransaction.amount))
    expect(splitAmount).toHaveValue(formatAmount(parentTransaction.amount))
    expect(unallocatedAmount).toHaveValue(formatAmount(0))
    expect(saveButton).not.toBeDisabled()
    expect(amountFields).toHaveLength(2)
  })

  it('updates form when amount changed', () => {
    rootStore.transactionsStore.getChildTransactions()
    render(<Splits formModel={model} />)
    getFields()

    expect(saveButton).not.toBeDisabled()
    expect(transactionAmount).toHaveValue(formatAmount(parentTransaction.amount))
    expect(splitAmount).toHaveValue(formatAmount(parentTransaction.amount))
    expect(unallocatedAmount).toHaveValue(formatAmount(0))

    const newAmount = 50
    userEvent.type(amountFields[1], '{selectall}{backspace}')
    userEvent.type(amountFields[1], newAmount.toString())
    userEvent.tab()
    expect(splitAmount).toHaveValue(formatAmount(parentTransaction.amount + newAmount))
    expect(unallocatedAmount).toHaveValue(formatAmount(-1 * newAmount))
    expect(saveButton).toBeDisabled()
  })

  it('saves splits', async () => {
    rootStore.transactionsStore.getChildTransactions()
    render(<Splits formModel={model} />)
    getFields()

    const allButton = await screen.findAllByRole('button')
    addButton = allButton.find(x => x.name === 'addSplit')
    userEvent.click(addButton)
    amountFields = within(splitRowsDiv).queryAllByLabelText('amount')
  })

})
