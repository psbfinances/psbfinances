'use strict'

import { makeAutoObservable, configure } from 'mobx'
import * as api from '../../shared/apiClient/index.js'
import { transactionModel, tripModel } from '../../shared/models/index.js'
import { c, utils } from '../../shared/core/index.js'

configure({
  enforceActions: 'never'
})

/**
 * Transactions store.
 */
export class TransactionsStore {
  /** @type {RootStore} */
  rootStore
  loading = true
  /** @type {psbf.TransactionUI[]} */
  items
  /** @type {?psbf.TransactionUI} */
  selectedItem
  /** @type {?psbf.TransactionUI} */
  editItem
  /** @type {?psbf.TransactionUI} */
  lastSelectedItem
  criteria
  /** @type {Filter} */ filter
  /** @type {psbf.TransactionUI[]} */
  childTransactions = []
  openingBalance = 0

  constructor (rootStore) {
    makeAutoObservable(this)
    this.rootStore = rootStore
    this.items = []
    this.selectedItem = null
    this.editItem = null
    this.lastSelectedItem = null
    this.filter = new Filter()
  }

  * getData (criteria) {
    this.loading = true
    if (criteria) this.criteria = criteria
    const data = yield api.transactionApi.list(this.filter)
    const { openingBalance, items } = data
    yield this.setItems(items, openingBalance)
  }

  get isEmpty () {
    return this.items.length === 0
  }

  get isNew () {
    return this.selectedItem && utils.isNewId(this.selectedItem.id)
  }

  /**
   *
   * @param {psbf.Transaction[]} items
   * @param {number} openingBalance
   * @return {Promise<void>}
   */
  * setItems (items, openingBalance = 0)  {
    this.openingBalance = openingBalance
    this.items = items
    this.setItemsMeta()
    yield this.setSelected()
    this.loading = false
  }

  setItemsMeta () {
    if (this.items.length === 0) return

    this.items = transactionModel.calcBalanceAndNewMonth(this.openingBalance, this.items)
    this.items.forEach(x => this.setItemMeta(x))
  }

  findById (id) {
    return this.items.find(x => x.id === id)
  }

  * setSelected (index = 0) {
    this.selectedItem = this.items.length > 0 ? this.items[index] : null
    yield this.setTrip()
    this.setEditItem()
    this.childTransactions = []
  }

  getChildTransactions () {
    if (!this.editItem) return

    this.childTransactions = []
    if (this.editItem.hasChildren) {
      this.items.filter(x => x.parentId === this.editItem.id).forEach(x => {
        const childTransaction = { ...x }
        this.childTransactions.push(childTransaction)
      })
    } else {
      this.childTransactions[0] = transactionModel.getNewChild(this.editItem)
      this.childTransactions[1] = transactionModel.getNewChild(this.editItem, 0)
    }
  }

  * saveTripInfo () {
    const hasTrip = this.editItem && !!this.editItem.tripDistance
    if (!hasTrip && !this.selectedItem.tripId) return Promise.resolve(null)

    if (this.selectedItem.tripId && !hasTrip) {
      yield api.tripApi.delete(this.selectedItem.tripId)
      return null
    }

    const trip = tripModel.getNew([...this.rootStore.masterDataStore.cars][0].id,
      this.editItem.description, this.editItem.postedDate, this.editItem.tripDistance)
    trip.transactionId = this.editItem.id
    const isExistingTrip = Boolean(this.selectedItem && this.selectedItem.tripId)
    if (isExistingTrip) {
      trip.id = this.selectedItem.tripId
      yield api.tripApi.patch(trip.id, trip)
    } else {
      yield api.tripApi.post(trip)
    }

    return trip.id
  }

  setTripDistance (distance) {
    this.editItem.tripDistance = distance
  }

  * save () {
    if (this.editItem.isDuplicate) {
      yield api.duplicateTransactionApi.put(this.editItem.id)
      yield this.getData()
      return
    }

    if (transactionModel.isEqual(this.editItem, this.selectedItem) && !this.isNew) return Promise.resolve()

    const { categoryId, businessId, description, note, postedDate, amount } = this.editItem
    const updatedTransaction = { categoryId, businessId, description, note, postedDate, amount, tripId: null }

    const tripId = yield this.saveTripInfo()
    if (tripId) updatedTransaction.tripId = tripId
    this.editItem.tripId = tripId

    if (this.editItem.id.includes('new')) {
      updatedTransaction.accountId = this.editItem.accountId
      /** @type {psbf.TransactionUI} */
      const savedTransaction = yield api.transactionApi.post(updatedTransaction)
      updatedTransaction.id = savedTransaction.id
    } else {
      yield api.transactionApi.patch(this.selectedItem.id, updatedTransaction)
      updatedTransaction.id = this.selectedItem.id
    }
    yield this.getData()
    this.setSelectedItemById(updatedTransaction.id)
  }

  * saveSplits () {
    const childTransactions = this.childTransactions.map(x => {
      return {
        id: x.id,
        businessId: x.businessId === c.selectId.NONE ? null : x.businessId,
        categoryId: x.businessId === c.selectId.NONE || x.categoryId === c.selectId.NONE ? null : x.categoryId,
        amount: x.amount,
        note: x.note
      }
    })

    const parentTransactionId = this.editItem.id
    yield api.transactionApi.patch(this.editItem.id, { childTransactions })
    yield this.getData()
    yield this.setSelectedItemById(parentTransactionId)
    this.getChildTransactions()
  }

  /**
   * @param {psbf.TransactionUI} transaction
   */
  setItemMeta (transaction) {
    transaction.accountName = this.rootStore.masterDataStore.accounts.get(transaction.accountId).shortName
    transaction.businessDescription = !transaction.businessId
      ? ''
      : transaction.businessId === c.PERSONAL_TYPE_ID
        ? 'Personal'
        : this.rootStore.masterDataStore.businesses.get(transaction.businessId).nickname
    transaction.categoryDescription = !transaction.categoryId
      ? ''
      : this.rootStore.masterDataStore.categories.get(transaction.categoryId).name
    transaction.isDuplicate = false
  }

  * setSelectedItemById (id) {
    if (this.selectedItem.id === id) return

    let selectedIndex = this.items.findIndex(x => x.id === id)
    if (selectedIndex === -1) selectedIndex = 0
    yield this.setSelected(selectedIndex)
  }

  * setTrip () {
    if (!this.selectedItem || !this.selectedItem.tripId) return Promise.resolve()

    const trip = yield api.tripApi.get(this.selectedItem.tripId)
    this.selectedItem.tripDistance = trip.distance
  }

  setNew (transaction) {
    transaction.id = transactionModel.getNewId()
    this.lastSelectedItem = this.selectedItem
    this.selectedItem = transaction
    this.setEditItem()
  }

  add (accountId) {
    this.setNew(transactionModel.getNew(accountId))
  }

  clone () {
    this.setNew(transactionModel.clone(this.selectedItem))
  }

  /**
   * Merges selected item with another one identified by secondId.
   * @link module:psbf/api/transactions
   * @param {string} secondId
   * @return {Promise}
   */
  * merge (secondId) {
    if (!secondId || !this.selectedItem || secondId === this.selectedItem.id) return Promise.resolve()

    let result = yield api.transactionApi.patchMerge(this.selectedItem.id, secondId)
    result = result.data
    if (!result.transaction) return Promise.resolve()

    const fromItemIndex = this.items.findIndex(x => x.id === result.deletedId)
    this.items.splice(fromItemIndex, 1)
    const toItemIndex = this.items.findIndex(x => x.id === result.transaction.id)
    this.items[toItemIndex] = result.transaction
    this.setItemsMeta()
    this.setSelectedItemById(result.transaction.id)
  }

  cancelAdd () {
    this.selectedItem = this.isEmpty ? null : this.lastSelectedItem
    this.setEditItem()
    this.lastSelectedItem = null
  }

  cancelEdit () {
    if (this.isNew) this.cancelAdd()
    else {
      if (this.childTransactions.length > 0) this.getChildTransactions()
      this.setEditItem()
    }
  }

  setEditItem () {
    this.editItem = this.selectedItem ? { ...this.selectedItem } : null
  }

  * delete () {
    if (!this.selectedItem || this.selectedItem.source !== c.sources.MANUAL) return

    yield api.transactionApi.delete(this.selectedItem.id)

    const selectedItemIndex = this.items.findIndex(x => x.id === this.selectedItem.id)
    const newSelectedIndex = selectedItemIndex >= 1 ? selectedItemIndex - 1 : 0
    this.items.splice(selectedItemIndex, 1)
    this.setItemsMeta()
    yield this.setSelected(newSelectedIndex)
  }

  * setNotDuplicate () {
    const duplicateCandidateTransactionIds = yield api.duplicateTransactionApi.resolve(this.editItem.id)
    this.editItem.isDuplicate = false
    this.editItem.duplicateCandidateId = null
    this.selectedItem.isDuplicate = false
    this.selectedItem.duplicateCandidateId = null
    const anotherTransactionId = duplicateCandidateTransactionIds.data.duplicateCandidateIds.find(x => x !== this.editItem.id)
    if (!anotherTransactionId) return

    const anotherTransactionIndex = this.items.findIndex(x => x.id === anotherTransactionId)
    if (anotherTransactionIndex >= 0) this.items[anotherTransactionIndex].duplicateCandidateId = null
  }

  * toggleReconciled () {
    yield this.updateScheduledAndReconciled({ reconciled: this.selectedItem.reconciled })
  }

  * toggleScheduled () {
    if (this.selectedItem.source === c.sources.IMPORT) return Promise.resolve()
    yield this.updateScheduledAndReconciled({ scheduled: this.selectedItem.scheduled })
  }

  * undoSplit () {
    yield api.transactionApi.patch(this.editItem.id, { childTransactions: [] })
    this.selectedItem.hasChildren = false
    this.editItem.hasChildren = false
    this.items = this.items.filter(x => x.parentId !== this.selectedItem.id)
    this.childTransactions = []
  }

  /**
   * @param {{reconciled: boolean}|{scheduled:boolean}} change
   */
  * updateScheduledAndReconciled (change) {
    const updatedTransaction = yield api.transactionApi.patch(this.selectedItem.id, change)
    this.editItem.reconciled = updatedTransaction.reconciled
    this.selectedItem.reconciled = updatedTransaction.reconciled
    this.selectedItem.scheduled = updatedTransaction.scheduled
    this.editItem.scheduled = updatedTransaction.scheduled
  }
}

export class Filter {
  accountId = c.selectId.ALL
  year = (new Date().getFullYear()).toString()
  month = 'all'
  categoryId = c.selectId.ALL
  search = ''
  businessId = null

  constructor () {
    makeAutoObservable(this)
  }

  get dateFrom () {
    const monthFrom = this.month === 'all' ? '01' : this.month
    return `${this.year}-${monthFrom}-01`
  }

  get dateTo () {
    const yearFrom = parseInt(this.year)
    const yearTo = this.month === '12' || this.month === 'all' ? yearFrom + 1 : yearFrom
    const monthTo = this.month === '12' || this.month === 'all'
      ? '01'
      : (parseInt(this.month) + 1).toString().padStart(2, '0')

    return `${yearTo}-${monthTo}-01`
  }

  reset () {
    this.year = (new Date().getFullYear()).toString()
    this.month = 'all'
    this.search = ''
    this.accountId = c.selectId.ALL
    this.categoryId = c.selectId.ALL
    this.businessId = null
  }

  get hasReferenceCriteria () {
    return this.accountId !== c.selectId.ALL || this.categoryId !== c.selectId.ALL
  }
}

