'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import ReactTooltip from 'react-tooltip'
import CurrencyInput from 'react-currency-input-field'

const BudgetForm = observer(
  class BudgetForm extends React.Component {

    handleCancelEdit = () => {
      this.props.model.setFormVisible(false)
    }

    handleSave = () => {
      this.props.model.setFormVisible(false)
    }

    render () {
      if (!this.props.model.formVisible) return null

      return <div id='dataContainer' className='frm formDataContainer1'>
        <div id='formContainer' data-testid='formContainer' className='formContainer1' style={{ width: '100%' }}>
          <table id='budgetForm' style={{ width: '100%' }}>
            <tbody>
              <tr>
                <th>Total</th>
                <td><input type='number' className='form-control' placeholder='10,000' /></td>
                <td>
                  <button className='btn btn-primary' data-tip='Fill each month by splitting year total'><i
                    className='fas fa-fill' /></button>
                </td>
              </tr>
              <tr>
                <td>Jan</td>
                <td>
                  <CurrencyInput
                    id='jan-am'
                    name='jan-am'
                    aria-label='January budget'
                    className='form-control text-right'
                    intlConfig={{ locale: 'en-US', currency: 'USD' }}
                    defaultValue={0}
                    fixedDecimalLength={0}
                  />
                </td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
              <tr>
                <td>Feb</td>
                <td><input type='number' className='form-control' placeholder={0} pattern='[0-9]' /></td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
              <tr>
                <td>Feb</td>
                <td><input type='number' className='form-control' /></td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
              <tr>
                <td>Feb</td>
                <td><input type='number' className='form-control' /></td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
              <tr>
                <td>Feb</td>
                <td><input type='number' className='form-control' /></td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
              <tr>
                <td>Feb</td>
                <td><input type='number' className='form-control' /></td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
              <tr>
                <td>Feb</td>
                <td><input type='number' className='form-control' /></td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
              <tr>
                <td>Feb</td>
                <td><input type='number' className='form-control' /></td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
              <tr>
                <td>Feb</td>
                <td><input type='number' className='form-control' /></td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
              <tr>
                <td>Feb</td>
                <td><input type='number' className='form-control' /></td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
              <tr>
                <td>Feb</td>
                <td><input type='number' className='form-control' /></td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
              <tr>
                <td>Feb</td>
                <td><input type='number' className='form-control' /></td>
                <td><input type='text' className='form-control' placeholder='Note' /></td>
              </tr>
            </tbody>
          </table>

          <div className='mt-4 mb-3'>
            <div className='form-group mb-3'>
              <button onClick={this.handleSave} className='btn btn-primary'>
                Save
              </button>
              <button onClick={this.handleCancelEdit} className='btn btn-outline-danger ms-2'>
                Cancel
              </button>
            </div>
          </div>


        </div>
        <ReactTooltip />
      </div>
    }

    save () {

    }
  }
)

export default BudgetForm

