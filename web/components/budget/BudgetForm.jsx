'use strict'

import React from 'react'
import { observer } from 'mobx-react'

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
          <table style={{ width: '100%' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid grey' }}>
                <th>Total</th>
                <th><input type='number' className='form-control' placeholder='10,000' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Jan</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Feb</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Feb</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Feb</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Feb</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Feb</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Feb</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Feb</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Feb</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Feb</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Feb</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
              </tr>
              <tr>
                <th>Feb</th>
                <th><input type='number' className='form-control' /></th>
                <th><input type='text' className='form-control' placeholder='Note' /></th>
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
      </div>
    }

    save () {

    }
  }
)

export default BudgetForm

