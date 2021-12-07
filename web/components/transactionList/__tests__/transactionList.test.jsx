'use strict'

import * as React from 'react'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import TransactionList from '../TransactionList.jsx'
import { Api } from '../../../../shared/apiClient/api.js'
import TransactionApi from '../../../../shared/apiClient/transactionApi.js'
import {
  accounts,
  amazonCardTransactions,
  businesses,
  cars,
  categories,
  citiCardTransactions
} from '../../__tests__/data.js'
import { MemoryRouter } from 'react-router'
import { rootStore } from '../../../stores/rootStore'

// jest.mock('axios')

const listResponse = { openingBalance: 10, items: amazonCardTransactions }
const citiCardListResponse = { openingBalance: -30000, items: citiCardTransactions }
const emptyListResponse = { openingBalance: 0, items: [] }

describe('TransactionList', () => {
  let handleChangeMock = jest.fn().mockImplementation(() => {})

  beforeAll(() => {
  })

  beforeEach(() => {
    handleChangeMock = jest.fn().mockImplementation(() => {})
  })

  afterEach(() => {
  })

  const getMasterDataApiMock = () => {
    let i = 0
    return jest.fn().mockImplementation(async () => {
      let result
      switch (i) {
        case 0:
          result = accounts
          break
        case 1:
          result = categories
          break
        case 2:
          result = businesses
          break
        case 3:
          result = cars
          break
      }
      i++
      return Promise.resolve(result)
    })
  }

  const expectDropdown = (select, itemsCount, firstValue, secondValue) => {
    expect(select).toBeInTheDocument()
    const selectItems = within(select).getAllByRole('listitem')
    expect(selectItems.length).toBe(itemsCount)
    expect(selectItems[firstValue[0]].textContent).toBe(firstValue[1])
    expect(selectItems[secondValue[0]].textContent).toBe(secondValue[1])
  }

  it('renders toolbar', async () => {
    TransactionApi.prototype.list = jest.fn().mockResolvedValueOnce(listResponse)
    Api.prototype.list = getMasterDataApiMock()
    render(
      <MemoryRouter>
        <TransactionList />
      </MemoryRouter>
    )

    let select = await screen.findByLabelText('accountSelector')
    expectDropdown(select, accounts.length + 1, [1, accounts[0].shortName], [2, accounts[1].shortName])

    select = await screen.findByLabelText('yearSelect')
    expectDropdown(select, 9, [0, 'This year'], [1, '2020'])

    select = await screen.findByLabelText('monthSelect')
    expectDropdown(select, 13, [0, 'All months'], [1, 'Jan'])

    select = await screen.findByLabelText('categorySelect')
    expectDropdown(select, categories.length + 1 + 1, [0, 'All categories'], [1, categories[0].name])
  })

  it('renders empty table', async () => {
    TransactionApi.prototype.list = jest.fn().mockResolvedValueOnce(emptyListResponse)
    Api.prototype.list = getMasterDataApiMock()
    render(
      <MemoryRouter>
        <TransactionList />
      </MemoryRouter>
    )

    const table = await screen.findByRole('table', { name: 'Transactions' })
    expect(table).toBeInTheDocument()
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(1)

    let descriptionLabel = screen.queryByLabelText('Description')
    expect(descriptionLabel).not.toBeInTheDocument()
  })

  it('renders some transactions and first transaction form', async () => {
    TransactionApi.prototype.list = jest.fn().mockResolvedValueOnce(listResponse)
    Api.prototype.list = getMasterDataApiMock()
    render(
      <MemoryRouter>
        <TransactionList />
      </MemoryRouter>
    )

    const table = await screen.findByRole('table', { name: 'Transactions' })
    expect(table).toBeInTheDocument()
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(amazonCardTransactions.length + 1)
    const descriptionCell = within(rows[1]).getAllByRole('cell')[1]
    expect(descriptionCell.innerHTML).toBe(amazonCardTransactions[0].description)

    /** @type {HTMLInputElement} */
    const descriptionField = screen.getByLabelText('Description')
    expect(descriptionField).toBeInTheDocument()
    expect(descriptionField.value).toBe(amazonCardTransactions[0].description)
  })

  it('handles click on a row', async () => {
    TransactionApi.prototype.list = jest.fn().mockResolvedValueOnce(listResponse)
    Api.prototype.list = getMasterDataApiMock()
    render(
      <MemoryRouter>
        <TransactionList />
      </MemoryRouter>
    )

    const table = await screen.findByRole('table', { name: 'Transactions' })
    expect(table).toBeInTheDocument()
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(amazonCardTransactions.length + 1)
    const descriptionCell = within(rows[2]).getAllByRole('cell')[1]
    expect(descriptionCell.innerHTML).toBe(amazonCardTransactions[1].description)

    /** @type {HTMLInputElement} */
    let descriptionField = screen.getByLabelText('Description')
    expect(descriptionField).toBeInTheDocument()
    expect(descriptionField.value).toBe(amazonCardTransactions[0].description)

    await descriptionCell.click()
    descriptionField = await screen.findByLabelText('Description')
    expect(descriptionField.value).toBe(amazonCardTransactions[1].description)
  })

  it('renders empty table if no records returned by filter', async () => {
    TransactionApi.prototype.list = jest.fn().
      mockResolvedValueOnce(listResponse).
      mockResolvedValueOnce(emptyListResponse)
    Api.prototype.list = getMasterDataApiMock()
    render(
      <MemoryRouter>
        <TransactionList />
      </MemoryRouter>
    )

    await screen.findByRole('table', { name: 'Transactions' })
    const anotherAccountSelectOption = screen.queryByText('Amazon CC').closest('a')
    await anotherAccountSelectOption.click()

    expect(TransactionApi.prototype.list).toHaveBeenCalledTimes(2)
    let table = await screen.findByRole('table', { name: 'Transactions' })
    let rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(1)
  })

  it('renders table if filter changes and selects top transaction', async () => {
    TransactionApi.prototype.list = jest.fn().
      mockResolvedValueOnce(listResponse).
      mockResolvedValueOnce(citiCardListResponse)
    Api.prototype.list = getMasterDataApiMock()
    Api.prototype.get = jest.fn().mockResolvedValueOnce({distance: 20})
    render(
      <MemoryRouter>
        <TransactionList />
      </MemoryRouter>
    )

    await screen.findByRole('table', { name: 'Transactions' })
    /** @type {HTMLInputElement} */
    let descriptionInForm = await screen.findByLabelText('Description')
    expect(descriptionInForm.value).toBe(amazonCardTransactions[0].description)
    const anotherAccountSelectOption = screen.queryByText('Amazon CC').closest('a')
    await anotherAccountSelectOption.click()

    expect(TransactionApi.prototype.list).toHaveBeenCalledTimes(2)
    const table = await screen.findByRole('table', { name: 'Transactions' })
    const rows = await within(table).findAllByRole('row')
    expect(rows).toHaveLength(citiCardTransactions.length + 1)
    expect(rootStore.transactionsStore.selectedItem.description).toBe(citiCardTransactions[0].description)
    descriptionInForm = await screen.findByLabelText('Description')
    expect(descriptionInForm.value).toBe(citiCardTransactions[0].description)
  })
})

