'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import { makeAutoObservable } from 'mobx'
import { rootStore } from '../../stores/rootStore.js'
import TransactionListToolbar from './TransactionListToolbar'
import { c } from '../../../shared/core/index.js'
import TransactionTable from './TransactionTable.jsx'
import { allAccountsOption, allCategories } from '../../stores/masterDataStore.js'
import TransactionForm, { FormModel } from '../transactionForm/TransactionForm'
import TransactionListModel from './transactionListModel.js'

/**
 * List of transactions.
 */
const TransactionList = observer(
  class TransactionList extends React.Component {
    /** @type {TransactionListModel} */ model

    constructor (props) {
      super(props)
      this.model = new TransactionListModel(rootStore)
    }

    componentWillUnmount () {
      rootStore.transactionsStore.filter.reset()
    }

    async componentDidMount () {
      if (!rootStore.masterDataStore.loaded) {
        await rootStore.masterDataStore.getData()
        this.model.formModel = new FormModel()
      }
      await this.model.loadData()
    }

    render () {
      return <div id='dataContainer' className='dataContainer'>
        <TransactionListToolbar model={this.model} />

        <div id='transactions' className='tableAndForm'>
          <TransactionTable model={this.model} />
          <TransactionForm model={this.model.formModel} />
        </div>

      </div>
    }
  }
)

export default TransactionList
