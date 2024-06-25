'use strict'

import { Tooltip } from 'react-tooltip'
import React, { useState } from 'react'
import AmountField from '../../core/AmountField.jsx'
import CancelOkButtons from '../../core/CancelOkButtons.jsx'

/**
 * BalanceCalculator is a functional component used to calculate balance.
 *
 * @param {Object} props - Props passed to the component.
 * @param {boolean} props.isNew - If the balance is new.
 * @param {boolean} props.visible - If the balance calculator is visible.
 * @param {Function} props.handleVisibility - A callback function to handle the visibility of the calculator.
 * @param {Function} props.handleCalculateClick - A callback function that is called on 'Calculate' button click.
 *
 * @returns {JSX.Element|null} The BalanceCalculator component or null based on conditions.
 */
export const BalanceCalculator = ({ isNew, visible, handleVisibility, handleCalculateClick }) => {
  const [currentBalance, setCurrentBalance] = useState(0)

  if (isNew) return null

  return visible
    ? <div style={{ backgroundColor: '#f6f8fb' }}>
      <hr />
      <div className='mb-3'>
        <label htmlFor='inputCurrentBalance' className='form-label'>Current balance</label>
        <AmountField fieldAmount={currentBalance} setValue={setCurrentBalance} />
      </div>
      <CancelOkButtons
        okLabel='Calculate'
        onOkClick={() => handleCalculateClick(currentBalance)}
        onCancelClick={handleVisibility} />
      <hr />
    </div>
    : <div className='mb-3'>
      <i
        onClick={handleVisibility}
        data-tip='Calculate opening balance based on the current balance'
        className='fas fa-calculator' />
      <Tooltip />
    </div>
}

