import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { accountsViewModel } from '../accountsViewModel' // adjust the import path accordingly
import { AccountForm } from '../AccountForm.jsx' // adjust the import path accordingly

// import utils from '@psbfinances/shared/core/utils.js'
jest.mock('@psbfinances/shared/core/utils.js', () => ({
  hasError: jest.fn(),
}));

describe('AccountForm', () => {
  let mockHandleSave
  let container

  beforeEach(() => {
    mockHandleSave = jest.fn();
    const { debug } = render(<AccountForm handleSave={mockHandleSave} />);
    console.log(debug())
  });

  it('handleSaveClick should call viewModel save', async () => {
    const mockItem = { id: '1', name: 'Test' }
    const mockResponse = { selectedId: '1', errors: {} }
    jest.mock('../accountsViewModel', () => {
      accountsViewModel: {
        save: jest.fn().mockResolvedValueOnce(mockResponse)
      }
    })
    container.debug()
    const saveButton = container.querySelector('button') // assuming the save button is the only button

    fireEvent.saveButton.click()

    expect(accountsViewModel.save).toHaveBeenCalledWith(mockItem)
  })

  it('should call props.handleSave if no errors', async () => {
    const mockResponse = { selectedId: '1', errors: {} }
    accountsViewModel.save.mockResolvedValueOnce(mockResponse)

    const saveButton = container.querySelector('button') // assuming the save button is the only button

    fireEvent.saveButton.click()

    expect(mockHandleSave).toHaveBeenCalledWith(mockResponse.selectedId)
  })

  // Note: Testing component state is not straightforward in the Testing Library
  // as it represents a more user-centered testing approach.
})
