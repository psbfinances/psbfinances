// noinspection RequiredAttributes

'use strict'

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'
import { AmountField, CoreFieldsModel } from '../CoreFields.jsx'
import { amazonCardTransactions, businesses, categories, accounts, cars } from '../../__tests__/data.js'
import { rootStore } from '../../../stores/rootStore.js'
import { c } from '../../../../shared/core/index.js'
import { SplitsModel } from '../Splits'

jest.unmock('console')

beforeAll(() => {
  rootStore.masterDataStore.setData(accounts, categories, businesses, cars)
})

/** AmountField */
describe('AmountField', () => {
  /** @type {CoreFieldsModel} */ let model

  beforeEach(async () => {
    await rootStore.transactionsStore.setItems(amazonCardTransactions)
    model = new CoreFieldsModel(rootStore.transactionsStore.editItem, false)
  })

  it('renders field with some value', () => {
    rootStore.transactionsStore.editItem.amount = -3000.71
    render(<AmountField model={model} />)

    expect(screen.getByLabelText('amount')).toHaveValue('-$3,000.71')
  })

  it('handles change on blur for parent transaction', () => {
    rootStore.transactionsStore.editItem.amount = -3000.71
    rootStore.transactionsStore.editItem.source = c.sources.MANUAL
    render(<AmountField model={model} />)
    const field = screen.getByLabelText('amount')
    userEvent.clear(field)
    userEvent.type(field, '-2000.2')
    userEvent.tab()
    expect(field).toHaveValue('-$2,000.2')
    expect(rootStore.transactionsStore.editItem.amount).toBe(-2000.2)
  })

  it('handles change on blur for child transaction', async () => {
    const parentTransaction = {
      'id': 'trans-01',
      'postedDate': '2021-03-24T05:00:00.000Z',
      'accountId': 'acc-04',
      'categoryId': null,
      'amount': -35804,
      'businessId': null,
      'description': 'Costco',
      'originalDescription': 'Costco',
      'sourceOriginalDescription': 'COSTCO WHSE#13',
      'reconciled': 1,
      'deleted': 0,
      'source': 'i',
      'scheduled': 1,
      'parentId': null,
      'hasChildren': 1,
      'tripId': null,
      'note': 'Party',
      'balance': -465727,
      'isNewMonth': false
    }
    const childTransaction1 = {
      'id': 'trans-02',
      'postedDate': '2021-03-24T05:00:00.000Z',
      'accountId': 'acc-04',
      'categoryId': 'cat-01',
      'amount': -25804,
      'businessId': 'p',
      'description': 'Costco',
      'originalDescription': null,
      'sourceOriginalDescription': null,
      'reconciled': 1,
      'deleted': 0,
      'source': 'm',
      'scheduled': 1,
      'parentId': 'trans-01',
      'hasChildren': 0,
      'tripId': null,
      'note': 'Party',
      'balance': 0,
      'isNewMonth': false
    }
    const childTransaction2 = {
      'id': 'trans-03',
      'postedDate': '2021-03-24T05:00:00.000Z',
      'accountId': 'acc-04',
      'categoryId': 'cat-02',
      'amount': -10000,
      'businessId': 'p',
      'description': 'Costco',
      'originalDescription': null,
      'sourceOriginalDescription': null,
      'reconciled': 1,
      'deleted': 0,
      'source': 'm',
      'scheduled': 1,
      'parentId': 'trans-01',
      'hasChildren': 0,
      'tripId': null,
      'note': 'Party',
      'balance': 0,
      'isNewMonth': false
    }
    const transactions = [amazonCardTransactions[0], amazonCardTransactions[1]]
    transactions.push(parentTransaction)
    transactions.push(childTransaction1)
    transactions.push(childTransaction2)
    await rootStore.transactionsStore.setItems(transactions, 10)
    await rootStore.transactionsStore.setSelectedItemById(parentTransaction.id)
    expect(rootStore.transactionsStore.editItem.id).toBe(parentTransaction.id)
    const splitModel = new SplitsModel()
    rootStore.transactionsStore.getChildTransactions()
    expect(rootStore.transactionsStore.childTransactions).toHaveLength(2)
    const coreFieldsModel = new CoreFieldsModel(splitModel.childTransaction[0], false)
    expect(rootStore.transactionsStore.childTransactions[0].amount).toBe(childTransaction1.amount)
    expect(rootStore.transactionsStore.childTransactions[1].amount).toBe(childTransaction2.amount)
    render(<div>
      <AmountField model={coreFieldsModel} />
      <button>Button</button>
    </div>)

    expect(rootStore.transactionsStore.childTransactions[0].amount).toBe(childTransaction1.amount)
    const field = screen.getByLabelText('amount')
    expect(field).toHaveValue('-$25,804')

    fireEvent.change(field, { target: { value: '-2000.3' } })
    fireEvent.focusOut(field)
    expect(field).toHaveValue('-$2,000.3')
    expect(splitModel.childTransaction[0].amount).toBe(-2000.3)
  })

  it('shows 0 if field cleared', () => {
    rootStore.transactionsStore.editItem.amount = -3000.71
    rootStore.transactionsStore.editItem.source = c.sources.MANUAL
    render(<AmountField model={model} />)

    const field = screen.getByLabelText('amount')
    userEvent.clear(field)
    userEvent.tab()
    expect(field).toHaveValue('$0')
  })
})
