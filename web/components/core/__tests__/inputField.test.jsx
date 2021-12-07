'use strict'

import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { render, screen } from '@testing-library/react'
import InputField from '../InputField.jsx'

jest.spyOn(console, 'log').mockImplementation()

const handleChange = e => {
  e.persist()
}

describe('InputField', () => {
  const fieldName = 'userName'
  const label = 'User name'
  const initialValue = 'JoeDoe'
  const errorClassName = 'is-invalid'
  const errorDivTestId = 'errorText'

  it('renders initial value', () => {
    const errors = {}

    render(<InputField id={fieldName} label={label} value={initialValue} autoFocus errors={errors}
                       handleChange={handleChange} />)

    const actual = screen.getByLabelText(label)
    expect(actual.value).toBe(initialValue)
  })

  it('renders error', async () => {
    const errors = {}
    const errorText = 'User name is required'
    errors[fieldName] = errorText

    render(<InputField id={fieldName} label={label} value={initialValue} autoFocus errors={errors}
                       handleChange={handleChange} />)

    const actual = screen.getByLabelText(label)
    expect(actual.value).toBe(initialValue)
    expect(actual).toHaveClass(errorClassName)
    const errorTextContainer = screen.getByTestId(errorDivTestId)
    expect(errorTextContainer).toHaveTextContent(errorText)

  })
})
