'use strict'

import { makeAutoObservable } from 'mobx'
import { rootStore } from '../../../stores/rootStore.js'
import { duplicateTransactionApi } from '@psbfinances/shared/apiClient/index.js'

export default class DuplicateListModel {
  items = []

  constructor () {
    makeAutoObservable(this)
  }

  getData = async () => {
    let data = await duplicateTransactionApi.list()
    if (data.lenght === 0) return

    await rootStore.masterDataStore.getAccounts()
    data.forEach(x => {
      x.account = rootStore.masterDataStore.accounts.has(x.accountId)
        ? rootStore.masterDataStore.accounts.get(x.accountId).shortName
        : 'Missing'
    })
    data = data.filter(x => x.account !== 'Missing').sort((x, y) => {
      return new Date(x.postedDate) <= new Date(y.postedDate) ? 1 : -1
    })
    this.items = data
  }

  handleUndo = async e => {
    e.preventDefault()
    const id = e.target.id
    try {
      await duplicateTransactionApi.undo(id)
      this.items = this.items.filter(x => x.id !== Number.parseInt(id))
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * @return {SettingsListToolbarModel} }
   */
  get toolbarModel () {
    return {
      title: 'DUPLICATE TRANSACTIONS',
      getData: this.getData
    }
  }
}
