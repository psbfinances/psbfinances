'use strict'

import { makeAutoObservable } from 'mobx'
import { rootStore } from '../../../stores/rootStore.js'
import { userModel } from '../../../../shared/models/index.js'
import { utils } from '../../../../shared/core/index.js'

export default class UserListModel {
  /** @type {User[]} */ items = []
  /** @type {?User} */ selectedItem
  /** @type {?User} */ editItem
  formErrors = {}

  constructor () {
    makeAutoObservable(this)
  }

  getData = async () => {
    await rootStore.masterDataStore.getUsers()

    const items = [...rootStore.masterDataStore.users.values()]
    this.selectedItem = !this.selectedItem
      ? this.selectedItem = items.length > 0 ? items[0] : null
      : rootStore.masterDataStore.users.get(this.selectedItem.id)
    this.editItem = items.length > 0 ? { ...this.selectedItem } : userModel.getNew()
    this.items = items
  }

  add = () => {
    this.editItem = userModel.getNew()
    this.selectedItem = null
  }

  setSelected = e => {
    this.selectedItem = rootStore.masterDataStore.users.get(e.currentTarget.id)
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
      title: 'USERS',
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
    editItem[name] = value
    this.editItem = editItem
  }

  save = async () => {
    const isNew = this.editItem.id.includes('new')
    this.formErrors = userModel.validate(this.editItem)
    if (Object.keys(this.formErrors).length > 0) return Promise.resolve()

    const result = await rootStore.masterDataStore.saveUser(this.editItem)
    if (!result.errors) {
      this.formErrors = {}
      await this.getData()
      if (isNew) {
        this.selectedItem = rootStore.masterDataStore.users.get(result.id)
        this.editItem = { ...this.selectedItem }
      }
      return
    }

    this.formErrors = result.errors
  }
}
