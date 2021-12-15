'use strict'

import React from 'react'
import BudgetToolbar from './BudgetToolbar.jsx'
import BudgetTable from './BudgetTable.jsx'
import BudgetForm from './BudgetForm.jsx'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'

class BudgetModel {
  formModel
  items = []
  total = {}
  formVisible = false

  constructor () {
    makeAutoObservable(this)
    this.formVisible = false
    this.total = { id: 'total', category: 'TOTAL', total: 1400 * 12, amount: 1400 },

      this.items = [
      { id: '1', category: 'Food', total: 1100 * 12, amount: 1100 },
      { id: '2', category: 'Misc expenses', total: 100 * 12, amount: 100 },
      { id: '3', category: 'Shopping', total: 200 * 12, amount: 200 }
    ]
  }

  setFormVisible (visible) {
    console.log('setVisible', visible)
    this.formVisible = visible
  }
}

const Budget = observer(
  class Budget1 extends React.Component {
    /** @type {BudgetModel} */ model

    constructor (props) {
      super(props)
      this.model = new BudgetModel()
    }

    render () {
      console.log('budget', this.model.formVisible)
      return <div id='dataContainer' className='dataContainer'>
        <BudgetToolbar model={this.model} />

        <div id='transactions' className='tableAndForm'>
          <BudgetTable model={this.model} />
          <BudgetForm model={this.model} />
        </div>

      </div>
    }
  }
)

export default Budget
