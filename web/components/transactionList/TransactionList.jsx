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

// import { Loading } from '../core'

/**
 * Transaction list.
 */
export class ListModel {
  /** @type {RootStore} */ rootStore
  /** @type {FinancialAccount} */ account
  /** @type {psbf.Category} */ category
  /** @type {string} */ dateFrom
  /** @type {string} */ dateTo
  /** @type {string} */ year
  /** @type {string} */ month
  /** @type {?string} */ secondSelectedId = null
  /** @type {FormModel} */ formModel
  loading = false

  /**
   * @param {RootStore} rootStore
   */
  constructor (rootStore) {
    makeAutoObservable(this)
    this.rootStore = rootStore
    this.formModel = new FormModel()
  }

  get accountColumnVisible () {
    return this.account && this.account.id === c.selectId.ALL
  }

  get balanceColumnVisible () {
    return this.account && this.account.id !== c.selectId.ALL &&
      this.category && this.category.id === c.selectId.ALL
  }

  get items () {
    return rootStore.transactionsStore.items
  }

  get scheduledColumnVisible () {
    return this.account && this.account.meta && this.account.meta.scheduledEnabled
  }

  get item () {
    return rootStore.transactionsStore.selectedItem
  }

  get addDisabled () {
    return !this.account || (this.account.id === c.selectId.ALL && this.rootStore.transactionsStore.isEmpty)
  }

  get mergeDisabled () {
    if (!Boolean(this.secondSelectedId)) return true

    const secondSelectedItem = rootStore.transactionsStore.findById(this.secondSelectedId)
    if (!secondSelectedItem) return true

    const selectedItemSource = rootStore.transactionsStore.selectedItem.source
    const secondItemSource = secondSelectedItem.source

    return (secondItemSource === c.sources.MANUAL && selectedItemSource === c.sources.MANUAL) ||
      (secondItemSource === c.sources.IMPORT && selectedItemSource === c.sources.IMPORT)
  }

  get cloneDisabled () {
    return rootStore.transactionsStore.isEmpty || rootStore.transactionsStore.isNew
  }

  async refresh () {
    const selectedId = rootStore.transactionsStore.editItem ? rootStore.transactionsStore.editItem.id : null
    await rootStore.transactionsStore.getData()
    if (selectedId) await rootStore.transactionsStore.setSelectedItemById(selectedId)
    this.setFormDetailedView()
  }

  async merge () {
    await rootStore.transactionsStore.merge(this.secondSelectedId)
    this.secondSelectedId = null
  }

  add () {
    this.formModel.toolBarId = 'details'
    rootStore.transactionsStore.add(this.account.id)
  }

  clone () {
    this.formModel.toolBarId = 'details'
    rootStore.transactionsStore.clone()
  }

  async loadData () {
    if (!this.rootStore.masterDataStore.hasAccounts) return Promise.resolve()

    this.loading = true
    if (rootStore.transactionsStore.filter.hasReferenceCriteria) {
      const { accountId, categoryId } = rootStore.transactionsStore.filter
      if (accountId) this.setAccount(accountId)
      if (categoryId) this.category = rootStore.masterDataStore.categories.get(categoryId)
    } else {
      rootStore.transactionsStore.filter.accountId = this.account
        ? this.account.id
        : this.rootStore.masterDataStore.firstAccount.id
    }
    await rootStore.transactionsStore.getData()

    if (!this.account) this.account = rootStore.masterDataStore.firstAccount
    if (!this.category) this.category = allCategories
    this.setFormDetailedView()
    this.loading = false
  }

  setAccount (id) {
    rootStore.transactionsStore.filter.accountId = id
    this.account = id === c.selectId.ALL ? allAccountsOption : this.rootStore.masterDataStore.accounts.get(id)
  }

  async setCategory (id) {
    rootStore.transactionsStore.filter.categoryId = id
    this.category = id === c.selectId.ALL ? allCategories : this.rootStore.masterDataStore.categories.get(id)
    await this.loadData()
  }

  setFormDetailedView () {
    this.formModel.setToolbarId('details')
    this.formModel.resetErrors()
  }

  async setPeriod (field, value) {
    if (field === 'yearSelect') rootStore.transactionsStore.filter.year = value
    else rootStore.transactionsStore.filter.month = value

    await this.loadData()
  }
}

const model = new ListModel(rootStore)
model.formModel = new FormModel()

/**
 * List of transactions.
 */
const TransactionList = observer(
  class TransactionList extends React.Component {
    /** @type {ListModel} */ model

    constructor (props) {
      super(props)
      // this.model = model
    }

    componentWillUnmount () {
      rootStore.transactionsStore.filter.reset()
    }

    async componentDidMount () {
      if (!rootStore.masterDataStore.loaded) {
        await rootStore.masterDataStore.getData()
      }
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
