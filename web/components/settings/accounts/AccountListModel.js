'use strict'

import { makeAutoObservable } from 'mobx'
import { rootStore } from '../../../stores/rootStore.js'
import { accountModel } from '../../../../shared/models/index.js'
import { utils } from '../../../../shared/core/index.js'

/**
 * Account list view model.
 */
export default class AccountListModel {
  /** @type {FinancialAccount[]} */ items = []
  /** @type {?FinancialAccount} */ selectedItem
  /** @type {?FinancialAccount} */ editItem
  formErrors = {}

  constructor () {
    makeAutoObservable(this)
  }

  getData = async () => {
    await rootStore.masterDataStore.getAccounts(false)

    const items = [...rootStore.masterDataStore.accounts.values()]
    items.shift()
    this.selectedItem = !this.selectedItem
      ? this.selectedItem = items[0]
      : rootStore.masterDataStore.accounts.get(this.selectedItem.id)
    this.editItem = { ...this.selectedItem }
    this.items = items
  }

  add = () => {
    this.editItem = accountModel.getNew()
    this.selectedItem = null
  }

  setSelected = e => {
    this.selectedItem = rootStore.masterDataStore.accounts.get(e.currentTarget.id)
    this.editItem = { ...this.selectedItem }
  }

  get isNew () {
    return utils.isNewId(this.editItem.id)
  }

  /**
   * @return {SettingsListToolbarModel} }
   */
  get toolbarModel () {
    return {
      title: 'ACCOUNTS',
      add: this.add,
      getData: this.getData
    }
  }

  undoEdit = () => {
    if (this.isNew) this.selectedItem = this.items[0]
    this.editItem = { ...this.selectedItem }
  }

  handleChange = e => {
    const target = e.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    const editItem = { ...this.editItem }
    if (name.includes('meta')) {
      if (!editItem.meta) editItem.meta = {}
      editItem.meta[name.replace('meta.', '')] = value
    } else {
      editItem[name] = value
    }
    this.editItem = editItem
  }

  handleAmountChange = value => this.editItem.openingBalance = value

  save = async () => {
    const isNew = this.editItem.id.includes('new')
    this.formErrors = accountModel.validate(this.editItem)
    if (Object.keys(this.formErrors).length > 0) return Promise.resolve()

    const result = await rootStore.masterDataStore.saveAccount(this.editItem)
    if (!result.errors) {
      this.formErrors = {}
      await this.getData()
      if (isNew) {
        this.selectedItem = rootStore.masterDataStore.accounts.get(result.id)
        this.editItem = { ...this.selectedItem }
      }
      return
    }

    this.formErrors = result.errors
  }
}
