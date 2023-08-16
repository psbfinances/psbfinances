'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import { rootStore } from '../../stores/rootStore.js'
import TransactionListToolbar from './TransactionListToolbar'
import TransactionTable from './TransactionTable.jsx'
import TransactionForm from '../transactionForm/TransactionForm'
import TransactionListModel from './transactionListModel.js'

const model = new TransactionListModel(rootStore)

/**
 * List of transactions.
 */
const TransactionList = observer(
  class TransactionList extends React.Component {
    /** @type {TransactionListModel} */ model

    componentWillUnmount () {
      rootStore.transactionsStore.filter.reset()
    }

    async componentDidMount () {
      await rootStore.masterDataStore.getData()
      await model.loadData()
    }

    render () {
      return <div id='dataContainer' className='dataContainer'>
        <TransactionListToolbar model={model} />

        <div id='transactions' className='tableAndForm'>
          <TransactionTable model={model} />
          <TransactionForm model={model.formModel} />
        </div>

      </div>
    }
  }
)

export default TransactionList
