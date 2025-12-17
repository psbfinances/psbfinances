import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
// Mock core imports (InputField/FormButtons) to avoid pulling in stores and other heavy deps
jest.mock('../../../core', () => {
  const React = require('react')
  return {
    InputField: ({ label, id, readOnly, handleChange, errors, value }) => (
      React.createElement('input', { 'aria-label': label, id, readOnly, onChange: (e) => handleChange({ target: { name: id, value: e.target.value } }), defaultValue: value })
    ),
    // Render actual save/cancel buttons so tests can assert visibility
    FormButtons: () => (
      React.createElement('div', { 'data-testid': 'form-buttons' },
        React.createElement('button', { type: 'button' }, 'Save'),
        React.createElement('button', { type: 'button' }, 'Cancel')
      )
    )
  }
})

import CategoryForm from '../CategoryForm.jsx'

function makeModel(overrides = {}) {
  return {
    editItem: {
      id: 'c1',
      name: 'Cats',
      isPersonal: true,
      type: 'e',
      classification: null,
      ...overrides
    },
    handleChange: jest.fn(),
    formErrors: {}
  }
}

describe('CategoryForm', () => {
  test('personal categories are editable: Name and Classification editable and Save/Cancel visible', () => {
    const model = makeModel({ isPersonal: true })
    render(<CategoryForm model={model} />)

    const nameInput = screen.getByLabelText(/Name/i)
    const select = screen.getByLabelText(/Classification/i)
    expect(nameInput).not.toHaveAttribute('readOnly')
    expect(select).toBeEnabled()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  test('business categories are editable: Name and Classification editable and Save/Cancel visible', () => {
    const model = makeModel({ isPersonal: false })
    render(<CategoryForm model={model} />)

    const nameInput = screen.getByLabelText(/Name/i)
    const select = screen.getByLabelText(/Classification/i)
    expect(nameInput).not.toHaveAttribute('readOnly')
    expect(select).toBeEnabled()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})
