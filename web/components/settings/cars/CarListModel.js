'use strict'

import { makeAutoObservable } from 'mobx'
import { rootStore } from '../../../stores/rootStore.js'
import { carModel } from '../../../../shared/models/index.js'
import { utils } from '../../../../shared/core/index.js'

export default class CarListModel {
  /** @type {Car[]} */ items = []
  /** @type {?Car} */ selectedItem
  /** @type {?Car} */ editItem
  formErrors = {}

  constructor () {
    makeAutoObservable(this)
  }

  getData = async () => {
    await rootStore.masterDataStore.getCars()
    const data = rootStore.masterDataStore.cars

    const items = [...data.values()]
    this.selectedItem = !this.selectedItem
      ? this.selectedItem = items.length > 0 ? items[0] : null
      : data.get(this.selectedItem.id)
    this.editItem = items.length > 0 ? { ...this.selectedItem } : carModel.getNew()
    this.items = items
  }

  add = () => {
    this.editItem = carModel.getNew()
    this.selectedItem = null
  }

  setSelected = e => {
    this.selectedItem = rootStore.masterDataStore.cars.get(e.currentTarget.id)
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
      title: 'CARS',
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
    const isNew = utils.isNewId(this.editItem.id)
    this.formErrors = carModel.validate(this.editItem)
    if (Object.keys(this.formErrors).length > 0) return Promise.resolve()

    const result = await rootStore.masterDataStore.saveCar(this.editItem)
    await rootStore.masterDataStore.getCars()
    if (!result.errors) {
      this.formErrors = {}
      await this.getData()
      if (isNew) {
        this.selectedItem = rootStore.masterDataStore.cars.get(result.id)
        this.editItem = { ...this.selectedItem }
      }
      return
    }

    this.formErrors = result.errors
  }
}
