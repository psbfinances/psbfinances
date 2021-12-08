'use strict'

import { makeAutoObservable } from 'mobx'
import { rootStore } from '../../../stores/rootStore.js'
import { categoryModel } from '../../../../shared/models/index.js'
import { c } from '../../../../shared/core/index.js'

/**
 * Category list view model.
 */
export default class CategoryListModel {
  /** @type {psbf.Category[]} */ items = []
  /** @type {?psbf.Category} */ selectedItem
  /** @type {?psbf.Category} */ editItem
  formErrors = {}

  constructor () {
    makeAutoObservable(this)
  }

  getData = async () => {
    await rootStore.masterDataStore.getCategories()

    const items = [...rootStore.masterDataStore.categories.values()]
    this.selectedItem = !this.selectedItem
      ? this.selectedItem = items[0]
      : rootStore.masterDataStore.categories.get(this.selectedItem.id)
    this.editItem = this.cloneItem(this.selectedItem)
    this.items = items
  }

  add = () => {
    this.editItem = categoryModel.getNew()
    this.selectedItem = null
  }

  setSelected = e => {
    this.selectedItem = rootStore.masterDataStore.categories.get(e.currentTarget.id)
    this.editItem = this.cloneItem(this.selectedItem)
  }

  /**
   * Clones category.
   * @return {typeof psbf.Category}
   */
  cloneItem (item) {
    return { ...item }
  }

  get isNew () {
    return this.editItem.id.includes(c.NEW_ID_PREFIX)
  }

  /**
   * @return {SettingsListToolbarModel} }
   */
  get toolbarModel () {
    return {
      title: 'CATEGORIES',
      add: this.add,
      getData: this.getData
    }
  }

  undoEdit = () => {
    if (this.isNew) this.selectedItem = this.items[0]
    this.editItem = this.cloneItem(this.selectedItem)
  }

  handleChange = e => {
    const target = e.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    const editItem = this.cloneItem(this.editItem)
    editItem[name] = value
    this.editItem = editItem
  }

  save = async () => {
    const isNew = this.editItem.id.includes('new')
    this.formErrors = categoryModel.validate(this.editItem)
    if (Object.keys(this.formErrors).length > 0) return Promise.resolve()

    const result = await rootStore.masterDataStore.saveCategory(this.editItem)
    await rootStore.masterDataStore.getCategories()
    if (!result.errors) {
      this.formErrors = {}
      await this.getData()
      if (isNew) {
        this.selectedItem = rootStore.masterDataStore.categories.get(result.id)
        this.editItem = this.cloneItem(this.selectedItem)
      }
      return
    }

    this.formErrors = result.errors
  }
}
