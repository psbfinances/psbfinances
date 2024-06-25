'use strict'

import React from 'react'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { accountsViewModel } from '../accountsViewModel'
import { AccountForm } from '../AccountForm.jsx'

// import utils from '@psbfinances/shared/core/utils.js'
// vi.mock('@psbfinances/shared/core/utils.js', () => {
//   return {
//     default: {
//       hasError: vi.fn()
//     }
//   }
// })

/**@type {FinancialAccount}  */

const existingItem = {
  id: '12345',
  shortName: 'Test Account',
  fullName: 'Test Account long name',
  type: 'Savings',
  balance: 2000
}

describe('AccountForm', () => {
  let user

  let container

  beforeEach(() => {
    user = userEvent.setup()
    vi.mock('../accountsViewModel.js', () => ({
      accountsViewModel: {
        save: vi.fn().mockResolvedValueOnce({ selectedId: '123456', errors: {} })
      }
    }))
  })

  it('renders Save button', () => {
    render(<AccountForm selectedItem={existingItem} />)
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('handleSaveClick should call viewModel save', async () => {
    const user = userEvent.setup()
    render(<AccountForm selectedItem={existingItem} handleSave={vi.fn()} />)
    await user.click(screen.getByText('Save'))

    expect(accountsViewModel.save).toHaveBeenCalledWith(existingItem)
  })
})

