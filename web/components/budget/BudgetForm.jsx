'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import ReactTooltip from 'react-tooltip'
import CurrencyInput from 'react-currency-input-field'
import { c } from '@psbfinances/shared/core/index.js'

/**
 *
 * @param {BudgetModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
const BudgetForm = observer(({ model }) => {
  if (!model || !model.formVisible) return null

  const category = model.selectedCategory

  return <div id='dataContainer' className='frm formDataContainer1'>
    <div id='budgetFormContainer'>
      <div className='budgetFormHeader'>{category.categoryName}</div>
      <table id='budgetForm' style={{ width: '100%' }}>
        <tbody>
          <tr>
            <th>Total</th>
            <td>
              <CurrencyInput
                id='amount-total'
                name='amount-total'
                className='form-control text-right'
                intlConfig={{ locale: 'en-US', currency: 'USD' }}
                value={model.editItem.amounts[0].amount}
                onValueChange={model.handleTotalChange}
                fixedDecimalLength={0} />
            </td>
            <td>
              <button
                className='btn btn-primary'
                onClick={model.handleFill}
                data-tip='Fill each month with this amount'>
                <i className='fas fa-fill' />
              </button>
            </td>
          </tr>
          {c.months.map((x, i) => <tr key={i + 1}>
            <td>{x}</td>
            <td>
              <CurrencyInput
                id={`amount-${i + 1}`}
                name={`amount-${i + 1}`}
                className='form-control text-right'
                intlConfig={{ locale: 'en-US', currency: 'USD' }}
                value={model.editItem.amounts[i + 1].amount}
                onValueChange={model.handleAmountChange}
                onBlur={model.handleAmountBlur}
                fixedDecimalLength={0} />
            </td>
            <td>
              <input
                id={`note-${i + 1}`}
                type='text'
                className='form-control'
                placeholder='Note'
                value={model.editItem.amounts[i + 1].note || ''}
                onChange={model.handleNoteChange}
              />
            </td>
          </tr>)}
        </tbody>
      </table>

      <div className='mt-4 mb-3'>
        <div className='form-group mb-3'>
          <button onClick={model.save} className='btn btn-primary'>
            Save
          </button>
          <button onClick={model.cancelEdit} className='btn btn-outline-danger ms-2'>
            Cancel
          </button>
        </div>
      </div>
    </div>
    <ReactTooltip />
  </div>
})

export default BudgetForm

