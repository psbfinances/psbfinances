'use strict'

import React, { useEffect, useState } from 'react'
import CurrencyInput from 'react-currency-input-field'
import { observer } from 'mobx-react'

/**
 *
 * @param {number} fieldAmount
 * @param {function} setValue
 * @return {Element}
 * @constructor
 */
let AmountField = ({ fieldAmount, setValue }) => {
  const [amount, setAmount] = useState(fieldAmount)

  const handleChange = value => setAmount(value)

  useEffect(() => {
    setAmount(fieldAmount)
  }, [fieldAmount])

  const handleBlur = e => {
    const amount = e.target.value === '' ? 0 : parseFloat(e.target.value.replace('$', '').replace(',', ''))
    setAmount(amount)
    setValue(amount)
  }

  return <div>
    <CurrencyInput
      id='amount'
      name='amount'
      aria-label='amount'
      // disabled={!model.amountFieldEnabled}
      className='form-control text-right'
      intlConfig={{ locale: 'en-US', currency: 'USD' }}
      value={amount}
      fixedDecimalLength={2}
      style={{ color: amount < 0 ? 'red' : 'green' }}
      onValueChange={handleChange}
      onBlur={handleBlur}
    />
  </div>
}
AmountField = observer(AmountField)
export default AmountField
