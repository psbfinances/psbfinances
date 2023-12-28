'use strict'

import * as React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { c } from '../../../../shared/core/index.js'
import { Api } from '../../../../shared/apiClient/api.js'
import TransactionForm, { FormModel } from '../TransactionForm.jsx'
import {
  accounts,
  amazonCardTransactions,
  businesses,
  categories
} from '../../__tests__/data.js'
import { rootStore } from '../../../stores/rootStore'
import { setupRootStore } from '../../__tests__/helper.js'
import { tripApi } from '../../../../shared/apiClient/index.js'
import TransactionApi from '../../../../shared/apiClient/transactionApi.js'

// jest.spyOn(console, 'log').mockImplementation()

const emptyLogger = () => {}
const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormat = { month: 'long', day: 'numeric', year: 'numeric' }

/** component */
describe('component', () => {
  let windowSpy
  /** @type {FormModel} */
  let viewModel
  let handlers = {
    handleNewSaved: emptyLogger,
    handleEditCanceled: emptyLogger,
    handleUpdate: emptyLogger,
    refresh: emptyLogger
  }
  /** @type {Transaction|null} */
  let transaction

  beforeAll(async () => {
    await setupRootStore()
  })

  beforeEach(async () => {
    rootStore.transactionsStore.setItems(amazonCardTransactions, 0)
    viewModel = new FormModel()
    const originalGetComputedStyle = window.getComputedStyle

    const getComputedStyle = (...args) => {
      const cssStyleDeclaration = originalGetComputedStyle(args[0], args[1])
      cssStyleDeclaration.setProperty('padding-left', '0')
      cssStyleDeclaration.setProperty('padding-right', '0')
      cssStyleDeclaration.setProperty('padding-top', '0')
      cssStyleDeclaration.setProperty('padding-bottom', '0')
      cssStyleDeclaration.setProperty('margin-left', '0')
      cssStyleDeclaration.setProperty('margin-right', '0')
      cssStyleDeclaration.setProperty('margin-top', '0')
      cssStyleDeclaration.setProperty('margin-bottom', '0')
      cssStyleDeclaration.setProperty('border-left-width', '0')
      cssStyleDeclaration.setProperty('border-right-width', '0')
      cssStyleDeclaration.setProperty('border-top-width', '0')
      cssStyleDeclaration.setProperty('border-bottom-width', '0')
      return cssStyleDeclaration
    }

    windowSpy = jest.spyOn(window, 'getComputedStyle')
    windowSpy.mockImplementation(getComputedStyle)
  })

  afterEach(() => {
    windowSpy.mockRestore()
  })

  /**
   *
   * @return {{deleteButton: HTMLElement, amountInput: HTMLElement, descriptionInput: HTMLElement, typeInput: HTMLElement, repeatButton: HTMLElement, originalDescriptionText: HTMLElement, postedDateInput: HTMLElement, cancelButton: HTMLElement, categoryInput: HTMLElement, noteInput: HTMLElement, sourceOriginalDescriptionText: HTMLElement, hasTripInput: HTMLElement, markDuplicateInput: HTMLElement, saveButton: HTMLElement, tripDistanceInput: HTMLElement}}
   */
  const getFields = () => {
    const postedDateInput = screen.getByLabelText('Date')
    const descriptionInput = screen.getByLabelText('Description')
    const typeInput = screen.getByLabelText('Type')
    const categoryInput = screen.getByLabelText('Category')
    const amountInput = screen.getByLabelText('Amount')
    const noteInput = screen.getByTestId('note')
    const markDuplicateInput = screen.queryByLabelText('Mark as duplicate')
    const saveButton = screen.queryByRole('button', { name: /save/i })
    const cancelButton = screen.queryByRole('button', { name: /cancel/i })
    const repeatButton = screen.queryByRole('button', { name: /repeat/i })
    const deleteButton = screen.queryByRole('button', { name: /delete/i })
    const hasTripInput = screen.queryByLabelText('Has a trip')
    const tripDistanceInput = screen.queryByLabelText('Distance:')
    const originalDescriptionText = screen.queryByTestId('originalDescription')
    const sourceOriginalDescriptionText = screen.queryByTestId('sourceOriginalDescription')
    return {
      postedDateInput,
      descriptionInput,
      typeInput,
      categoryInput,
      amountInput,
      noteInput,
      markDuplicateInput,
      saveButton,
      repeatButton,
      deleteButton,
      cancelButton,
      hasTripInput,
      tripDistanceInput,
      originalDescriptionText,
      sourceOriginalDescriptionText
    }
  }

  it('renders imported transaction', () => {
    TransactionApi.prototype.list = jest.fn().mockResolvedValueOnce(amazonCardTransactions)
    render(<TransactionForm model={viewModel} />)

    const {
      postedDateInput,
      descriptionInput,
      typeInput,
      categoryInput,
      amountInput,
      noteInput,
      markDuplicateInput,
      saveButton,
      deleteButton,
      cancelButton,
      originalDescriptionText,
      sourceOriginalDescriptionText
    } = getFields()

    // screen.debug()
    const expectedTransaction = rootStore.transactionsStore.editItem
    expect(expectedTransaction.id).toBe(amazonCardTransactions[0].id)
    expect(descriptionInput).toBeInTheDocument()
    expect(descriptionInput).not.toHaveAttribute('readonly')
    expect(descriptionInput).toHaveValue(expectedTransaction.description)

    expect(postedDateInput).toBeInTheDocument()
    expect(postedDateInput).toHaveAttribute('readonly')
    const expectedPostedDate = new Date(expectedTransaction.postedDate).toLocaleDateString('en-US', dateFormat)
    expect(postedDateInput).toHaveValue(expectedPostedDate)

    expect(typeInput).toBeInTheDocument()
    expect(typeInput).not.toHaveAttribute('readonly')
    expect(typeInput).toHaveDisplayValue(expectedTransaction.businessDescription)

    expect(categoryInput).toBeInTheDocument()
    expect(categoryInput).not.toHaveAttribute('readonly')
    expect(categoryInput).toHaveDisplayValue(expectedTransaction.categoryDescription)

    expect(amountInput).toBeInTheDocument()
    expect(amountInput).not.toHaveAttribute('readonly')
    expect(amountInput).toHaveDisplayValue(formatter.format(expectedTransaction.amount))

    expect(noteInput).toBeInTheDocument()
    expect(noteInput).not.toHaveAttribute('readonly')
    expect(noteInput).toHaveDisplayValue(expectedTransaction.note)

    expect(markDuplicateInput).toBeInTheDocument()
    expect(saveButton).toBeInTheDocument()
    // expect(repeatButton).toBeInTheDocument()
    expect(cancelButton).toBeInTheDocument()
    expect(deleteButton).not.toBeInTheDocument()

    expect(originalDescriptionText).toBeInTheDocument()
    expect(originalDescriptionText.textContent).toBe(`- ${expectedTransaction.originalDescription}`)
    expect(sourceOriginalDescriptionText).toBeInTheDocument()
    expect(sourceOriginalDescriptionText.textContent).toBe(`- ${expectedTransaction.sourceOriginalDescription}`)
  })

  it('handles changes in the fields', () => {
    render(<TransactionForm model={viewModel} />)

    const { descriptionInput, typeInput, categoryInput, noteInput } = getFields()

    const expectedTransaction = rootStore.transactionsStore.editItem
    expect(descriptionInput).toHaveValue(expectedTransaction.description)
    expect(typeInput).toHaveDisplayValue(expectedTransaction.businessDescription)
    expect(categoryInput).toHaveDisplayValue(expectedTransaction.categoryDescription)
    expect(noteInput).toHaveDisplayValue(expectedTransaction.note)

    userEvent.selectOptions(typeInput, 'p')
    expect(typeInput).toHaveDisplayValue('Personal')

    userEvent.selectOptions(categoryInput, categories[5].id)
    expect(categoryInput).toHaveDisplayValue(categories[5].name)

    const newNote = 'Changed note'
    userEvent.clear(noteInput)
    userEvent.type(noteInput, newNote)
    expect(noteInput).toHaveDisplayValue(newNote)

    const newDescription = 'AWS'
    userEvent.type(descriptionInput, '{selectall}{backspace}')
    expect(descriptionInput).toHaveValue('')
    userEvent.type(descriptionInput, newDescription)
    expect(descriptionInput).toHaveValue(newDescription)

  })

  it('renders imported transaction on selection change', async () => {
    const { rerender } = render(<TransactionForm model={viewModel} />)
    rootStore.transactionsStore.setSelectedItemById(amazonCardTransactions[1].id)
    rootStore.transactionsStore.selectedItem.tripId = 'trip01'
    rootStore.transactionsStore.setItemMeta(rootStore.transactionsStore.selectedItem)
    rootStore.transactionsStore.setEditItem()

    tripApi.get = jest.fn().mockResolvedValueOnce(trip)
    rerender(<TransactionForm model={viewModel} />)

    const {
      postedDateInput,
      descriptionInput,
      typeInput,
      categoryInput,
      noteInput,
      markDuplicateInput,
      saveButton,
      cancelButton
    } = getFields()

    const expectedTransaction = rootStore.transactionsStore.editItem
    expect(descriptionInput).toBeInTheDocument()
    expect(descriptionInput).not.toHaveAttribute('readonly')
    expect(descriptionInput).toHaveValue(expectedTransaction.description)

    expect(postedDateInput).toBeInTheDocument()
    expect(postedDateInput).toHaveAttribute('readonly')
    const expectedPostedDate = new Date(expectedTransaction.postedDate).toLocaleDateString('en-US', dateFormat)
    expect(postedDateInput).toHaveValue(expectedPostedDate)

    expect(typeInput).toBeInTheDocument()
    expect(typeInput).not.toHaveAttribute('readonly')
    expect(typeInput).toHaveDisplayValue('Personal')

    expect(categoryInput).toBeInTheDocument()
    expect(categoryInput).not.toHaveAttribute('readonly')
    expect(categoryInput).toHaveDisplayValue(expectedTransaction.categoryDescription)

    expect(noteInput).toBeInTheDocument()
    expect(noteInput).not.toHaveAttribute('readonly')
    expect(noteInput).toHaveDisplayValue(expectedTransaction.note)

    expect(markDuplicateInput).toBeInTheDocument()
    expect(saveButton).toBeInTheDocument()
    // expect(repeatButton).toBeInTheDocument()
    expect(cancelButton).toBeInTheDocument()
  })

  it('renders transaction with trip', async () => {
    const { rerender } = render(<TransactionForm model={viewModel} />)
    tripApi.get = jest.fn().mockResolvedValueOnce(trip)
    rootStore.transactionsStore.items[1].tripId = 'trip01'
    rootStore.transactionsStore.setSelectedItemById(rootStore.transactionsStore.items[1].id)
    rootStore.transactionsStore.setItemMeta(rootStore.transactionsStore.selectedItem)
    rootStore.transactionsStore.setEditItem()

    rerender(<TransactionForm model={viewModel} />)

    let hasTripInput = await screen.findByLabelText('Has a trip')
    let tripDistanceInput = screen.queryByLabelText('Distance:')

    expect(hasTripInput).toBeInTheDocument()
    expect(hasTripInput).toBeChecked()
    expect(tripDistanceInput).toBeInTheDocument()
    expect(tripDistanceInput).toHaveValue(50)

    rootStore.transactionsStore.setSelectedItemById(rootStore.transactionsStore.items[0].id)
    rootStore.transactionsStore.setItemMeta(rootStore.transactionsStore.selectedItem)
    rootStore.transactionsStore.setEditItem()
    rerender(<TransactionForm model={viewModel} handlers={handlers} />)
    hasTripInput = await screen.findByLabelText('Has a trip')
    tripDistanceInput = screen.queryByLabelText('Distance:')
    expect(hasTripInput).toBeInTheDocument()
    expect(hasTripInput).not.toBeChecked()
    expect(tripDistanceInput).not.toBeInTheDocument()
  })

  it('renders new transaction', async () => {
    const { rerender } = render(<TransactionForm model={viewModel} />)
    viewModel.ad
    rootStore.transactionsStore.add(accounts[1].id)
    rerender(<TransactionForm model={viewModel} />)
    const {
      postedDateInput,
      descriptionInput,
      typeInput,
      categoryInput,
      amountInput,
      noteInput,
      markDuplicateInput,
      saveButton,
      repeatButton,
      deleteButton,
      cancelButton,
      originalDescriptionText,
      sourceOriginalDescriptionText
    } = getFields()

    expect(saveButton).toBeInTheDocument()
    expect(cancelButton).toBeInTheDocument()
    expect(markDuplicateInput).not.toBeInTheDocument()
    expect(repeatButton).not.toBeInTheDocument()
    expect(deleteButton).not.toBeInTheDocument()

    expect(descriptionInput).not.toHaveAttribute('readonly')
    expect(descriptionInput).toHaveValue('')
    expect(postedDateInput).not.toHaveAttribute('readonly')
    expect(typeInput).not.toHaveAttribute('readonly')
    expect(typeInput).toHaveDisplayValue('Personal')
    expect(categoryInput).not.toHaveAttribute('readonly')
    expect(categoryInput).toHaveDisplayValue('')
    expect(amountInput).not.toHaveAttribute('readonly')
    expect(amountInput).toHaveDisplayValue('$0')
    expect(noteInput).not.toHaveAttribute('readonly')
    expect(noteInput).toHaveDisplayValue('')

    expect(originalDescriptionText).not.toBeInTheDocument()
    expect(sourceOriginalDescriptionText).not.toBeInTheDocument()
  })

  it('renders new clone transaction', async () => {
    const { rerender } = render(<TransactionForm model={viewModel} />)
    rootStore.transactionsStore.clone()
    rerender(<TransactionForm model={viewModel} />)

    const {
      postedDateInput,
      descriptionInput,
      typeInput,
      categoryInput,
      amountInput,
      noteInput,
      markDuplicateInput,
      saveButton,
      repeatButton,
      deleteButton,
      cancelButton
    } = getFields()

    const expectedTransaction = rootStore.transactionsStore.editItem
    expect(saveButton).toBeInTheDocument()
    expect(cancelButton).toBeInTheDocument()
    expect(markDuplicateInput).not.toBeInTheDocument()
    expect(repeatButton).not.toBeInTheDocument()
    expect(deleteButton).not.toBeInTheDocument()

    expect(descriptionInput).toBeInTheDocument()
    expect(descriptionInput).not.toHaveAttribute('readonly')
    expect(descriptionInput).toHaveValue(amazonCardTransactions[0].description)

    expect(postedDateInput).toBeInTheDocument()
    expect(postedDateInput).not.toHaveAttribute('readonly')
    const expectedDate = new Date(rootStore.transactionsStore.editItem.postedDate).toLocaleDateString('en-US',
      dateFormat)
    expect(postedDateInput).toHaveValue(expectedDate)

    expect(typeInput).toBeInTheDocument()
    expect(typeInput).not.toHaveAttribute('readonly')
    const expectedBusiness = rootStore.transactionsStore.editItem.businessId === 'p'
      ? 'Personal'
      : rootStore.masterDataStore.businesses.get(rootStore.transactionsStore.editItem.businessId).nickname
    expect(typeInput).toHaveDisplayValue(expectedBusiness)

    const expectedCategory = rootStore.masterDataStore.categories.get(rootStore.transactionsStore.editItem.categoryId)
    expect(categoryInput).toBeInTheDocument()
    expect(categoryInput).not.toHaveAttribute('readonly')
    expect(categoryInput).toHaveDisplayValue(expectedCategory.name)

    expect(amountInput).toBeInTheDocument()
    expect(amountInput).not.toHaveAttribute('readonly')
    expect(amountInput).toHaveDisplayValue(formatter.format(rootStore.transactionsStore.editItem.amount))

    expect(noteInput).toBeInTheDocument()
    expect(noteInput).not.toHaveAttribute('readonly')
    expect(noteInput).toHaveDisplayValue(expectedTransaction.note)
  })

  it('renders manual transaction', async () => {
    rootStore.transactionsStore.items[1].source = c.sources.MANUAL
    rootStore.transactionsStore.setSelectedItemById(rootStore.transactionsStore.items[1].id)
    rootStore.transactionsStore.setItemMeta(rootStore.transactionsStore.selectedItem)
    rootStore.transactionsStore.setEditItem()
    render(<TransactionForm model={viewModel} />)

    const {
      postedDateInput,
      descriptionInput,
      typeInput,
      categoryInput,
      amountInput,
      noteInput,
      markDuplicateInput,
      saveButton,
      deleteButton,
      cancelButton,
      originalDescriptionText,
      sourceOriginalDescriptionText
    } = getFields()

    const expectedTransaction = rootStore.transactionsStore.editItem
    expect(expectedTransaction.id).toBe(rootStore.transactionsStore.items[1].id)
    expect(postedDateInput).not.toHaveAttribute('readonly')
    expect(postedDateInput).
      toHaveValue(new Date(rootStore.transactionsStore.editItem.postedDate).toLocaleDateString('en-US', dateFormat))

    expect(descriptionInput).not.toHaveAttribute('readonly')
    expect(descriptionInput).toHaveValue(expectedTransaction.description)

    expect(typeInput).not.toHaveAttribute('readonly')
    expect(typeInput).toHaveDisplayValue(expectedTransaction.businessDescription)

    expect(categoryInput).not.toHaveAttribute('readonly')
    expect(categoryInput).toHaveDisplayValue(expectedTransaction.categoryDescription)

    expect(amountInput).not.toHaveAttribute('readonly')
    expect(amountInput).toHaveValue(formatter.format(rootStore.transactionsStore.editItem.amount))

    expect(noteInput).not.toHaveAttribute('readonly')
    expect(noteInput).toHaveDisplayValue(expectedTransaction.note)

    expect(markDuplicateInput).not.toBeInTheDocument()
    expect(saveButton).toBeInTheDocument()
    expect(deleteButton).toBeInTheDocument()
    // expect(repeatButton).toBeInTheDocument()
    expect(cancelButton).toBeInTheDocument()

    expect(originalDescriptionText).not.toBeInTheDocument()
    expect(sourceOriginalDescriptionText).not.toBeInTheDocument()
  })

  it('handles submit', async () => {
    const transactionApiPatchMock = jest.fn().mockImplementation(() => {})
    TransactionApi.prototype.list = jest.fn().mockResolvedValueOnce({ openingBalance: 20, items: amazonCardTransactions } )
    TransactionApi.prototype.listDescriptionsLookup = jest.fn().mockResolvedValueOnce([{ description: 'Amazon' }])
    Api.prototype.patch = transactionApiPatchMock

    render(<TransactionForm model={viewModel} />)

    const { typeInput, categoryInput, noteInput, saveButton } = getFields()
    userEvent.selectOptions(typeInput, 'p')
    userEvent.selectOptions(categoryInput, categories[2].id)
    const newNote = 'Changed note'
    userEvent.clear(noteInput)
    userEvent.type(noteInput, newNote)
    const newDescription = 'Amazon'
    let descriptionComboBox = await screen.findAllByRole('combobox')
    let descriptionInput = descriptionComboBox[0]

    userEvent.clear(descriptionInput)
    await userEvent.type(descriptionInput, newDescription)
    const descriptionOptions = await screen.findAllByRole('listbox')
    await userEvent.click(descriptionOptions[0])
    const expectedDescriptionOptions = screen.getAllByRole('option', { name: 'Amazon' })
    await userEvent.click(expectedDescriptionOptions[0])

    await userEvent.click(saveButton)
    const expectedTransaction = rootStore.transactionsStore.editItem

    await waitFor(() => {
      expect(transactionApiPatchMock).toHaveBeenCalledTimes(1)
      expect(transactionApiPatchMock).toHaveBeenCalledWith(expectedTransaction.id, {
        postedDate: expectedTransaction.postedDate,
        amount: expectedTransaction.amount,
        categoryId: categories[2].id,
        businessId: 'p',
        id: 'trans-001',
        note: newNote,
        description: newDescription,
        tripId: null
      })
    })
  })

  it('handles submit new', async () => {
    const newTransaction = amazonCardTransactions[0]
    const transactionApiPatchMock = jest.fn().mockImplementation(() => newTransaction)
    const allTransactions = [...amazonCardTransactions, newTransaction]
    TransactionApi.prototype.list = jest.fn().mockResolvedValueOnce({ openingBalance: 100, items: allTransactions })
    Api.prototype.post = transactionApiPatchMock

    const { rerender } = render(<TransactionForm model={viewModel} />)

    rootStore.transactionsStore.add(amazonCardTransactions[0].accountId)
    rerender(<TransactionForm model={viewModel} />)

    const {
      descriptionInput,
      typeInput,
      categoryInput,
      noteInput,
      saveButton
    } = getFields()

    const newDescription = 'AWS'
    userEvent.type(descriptionInput, newDescription)
    fireEvent.focusOut(descriptionInput)
    rootStore.transactionsStore.editItem.description = newDescription
    userEvent.selectOptions(typeInput, 'p')
    userEvent.selectOptions(categoryInput, rootStore.masterDataStore.firstCategory.id)
    const newNote = 'Changed note'
    userEvent.type(noteInput, newNote)

    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(transactionApiPatchMock).toHaveBeenCalledWith(expect.objectContaining({
        accountId: newTransaction.accountId,
        categoryId: rootStore.masterDataStore.firstCategory.id,
        businessId: 'p',
        note: 'Changed note',
        description: newDescription,
        amount: 0
      }))
    })
  })

  it('handles submit with trip', async () => {
    const newTransaction = amazonCardTransactions[0]
    const apiPostMock = jest.fn().mockImplementation(() => {})
    const apiPatchMock = jest.fn().mockImplementation(() => {})
    const apiDeleteMock = jest.fn().mockImplementation(() => {})
    TransactionApi.prototype.list = jest.fn().mockResolvedValueOnce({ openingBalance: 10, items: [newTransaction] })
    Api.prototype.post = apiPostMock
    Api.prototype.patch = apiPatchMock
    Api.prototype.delete = apiDeleteMock

    render(<TransactionForm model={viewModel} />)

    const { hasTripInput, saveButton } = getFields()
    expect(hasTripInput).toBeInTheDocument()

    userEvent.click(hasTripInput)
    const tripDistanceInput = await screen.findByLabelText('Distance:')
    expect(tripDistanceInput).toBeInTheDocument()
    userEvent.clear(tripDistanceInput)
    userEvent.type(tripDistanceInput, '50')

    await userEvent.click(saveButton)
    await waitFor(() => {
      expect(apiPatchMock).toHaveBeenCalledTimes(1)
      expect(apiPostMock).toHaveBeenCalledTimes(1)
      expect(apiDeleteMock).toHaveBeenCalledTimes(0)
      expect(apiPostMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
        carId: [...rootStore.masterDataStore.cars][0].id,
        description: newTransaction.description,
        distance: '50',
        endDate: newTransaction.postedDate,
        startDate: newTransaction.postedDate,
        transactionId: newTransaction.id
      }))
    })
  })

  it.skip('handles submit with trip removed', async () => {
    const newTransaction = amazonCardTransactions[0]
    newTransaction.tripId = 'tripId-01'
    TransactionApi.prototype.list = jest.fn().mockResolvedValueOnce([newTransaction])
    const apiPostMock = jest.fn().mockImplementation(() => {})
    const apiPatchMock = jest.fn().mockImplementation(() => {})
    const apiDeleteMock = jest.fn().mockImplementation(() => {})
    Api.prototype.post = apiPostMock
    Api.prototype.patch = apiPatchMock
    Api.prototype.delete = apiDeleteMock

    render(<TransactionForm />)

    const expectedTransaction = rootStore.transactionsStore.editItem
    expect(expectedTransaction.id).toBe(amazonCardTransactions[0].id)
    // const { hasTripInput, tripDistance, saveButton } = getFields()
    const hasTripInput = await screen.findByLabelText('Has a trip')
    console.log(hasTripInput.checked)

    expect(hasTripInput).toBeInTheDocument()
    expect(hasTripInput).toBeChecked()

    userEvent.click(hasTripInput)
    expect(tripDistance).toBeUndefined()

    await userEvent.click(saveButton)
    await waitFor(() => {
      expect(apiPatchMock).toHaveBeenCalledTimes(1)
      expect(apiPostMock).toHaveBeenCalledTimes(0)
      expect(apiDeleteMock).toHaveBeenCalledTimes(1)
      expect(apiDeleteMock).toHaveBeenCalledWith('trip-01')
    })
  })

  it.skip('handles repeat clicked for manual transaction', async () => {
    transaction.source = c.sources.MANUAL
    render(<TransactionForm
      transaction={transaction}
      categories={categories}
      businesses={businesses}
      handleDuplicateSaved={emptyLogger}
      handleUpdate={emptyLogger} />)

    const {
      saveButton,
      repeatButton,
      deleteButton,
      cancelButton
    } = getFields()

    await userEvent.click(repeatButton)

    expect(saveButton).not.toBeInTheDocument()
    expect(repeatButton).not.toBeInTheDocument()
    expect(deleteButton).not.toBeInTheDocument()
    expect(cancelButton).not.toBeInTheDocument()
  })
})

const anotherTransactionWithTrip = {
  id: 'ckmbwxihq000rkjcu7rl22llv',
  accountId: 'accountId1',
  postedDate: '2021-03-12T06:00:00.000Z',
  categoryId: '22',
  amount: -1000,
  balance: -300000,
  businessId: 'p',
  deleted: 0,
  note: 'Mayo',
  description: 'HEB',
  originalDescription: 'H-E-B',
  reconciled: 0,
  sourceOriginalDescription: 'H-E-B',
  source: c.sources.IMPORT,
  tripId: 'tripId-01'
}

const trip = {
  'id': 'tripId-01',
  'description': anotherTransactionWithTrip.description,
  'startDate': '2021-05-05T05:00:00.000Z',
  'endDate': '2021-05-05T05:00:00.000Z',
  'distance': 50,
  'transactionId': anotherTransactionWithTrip.id,
  'meta': null,
  'carId': 'car-01'
}
