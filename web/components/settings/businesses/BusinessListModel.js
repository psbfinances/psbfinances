'use strict'

import { makeAutoObservable } from 'mobx'
import { rootStore } from '../../../stores/rootStore.js'
import { businessModel } from '../../../../shared/models/index.js'
import { utils } from '../../../../shared/core/index.js'

export default class BusinessListModel {
  /** @type {Business[]} */ items = []
  /** @type {?Business} */ selectedItem
  /** @type {?Business} */ editItem
  formErrors = {}

  constructor () {
    makeAutoObservable(this)
  }

  getData = async () => {
    await rootStore.masterDataStore.getBusinesses()
    const data = rootStore.masterDataStore.businesses

    const items = [...data.values()]
    this.selectedItem = !this.selectedItem
      ? this.selectedItem = items.length > 0 ? items[0] : null
      : data.get(this.selectedItem.id)
    this.editItem = items.length > 0 ? { ...this.selectedItem } : businessModel.getNew()
    this.items = items
  }

  add = () => {
    this.editItem = businessModel.getNew()
    this.selectedItem = null
  }

  setSelected = e => {
    this.selectedItem = rootStore.masterDataStore.businesses.get(e.currentTarget.id)
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
      title: 'BUSINESSES',
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
    this.formErrors = businessModel.validate(this.editItem)
    if (Object.keys(this.formErrors).length > 0) return Promise.resolve()

    const result = await rootStore.masterDataStore.saveBusiness(this.editItem)
    if (!result.errors) {
      this.formErrors = {}
      await this.getData()
      if (isNew) {
        this.selectedItem = rootStore.masterDataStore.businesses.get(result.id)
        this.editItem = { ...this.selectedItem }
      }
      return
    }

    this.formErrors = result.errors
  }
}
