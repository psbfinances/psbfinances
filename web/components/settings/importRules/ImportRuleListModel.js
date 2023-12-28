'use strict'

import { makeAutoObservable } from 'mobx'
import { rootStore } from '../../../stores/rootStore.js'
import { c, utils } from '../../../../shared/core/index.js'
import DipRule from '../../../../shared/models/dipRule.js'
import isCurrency from 'validator/lib/isCurrency.js'

const fieldMapping = {
  all: {
    accountId: 'Account',
    description: 'Description',
    amount: 'Amount',
    categoryId: 'Category',
    businessId: 'Type',
    tripDistance: 'Trip distance'
  },
  mint: {
    'Account Name': 'accountId'
  },
  boaAgr: {
    'Account Name': 'accountId'
  },
  appleCard: {
  }
}

/**
 * @typedef {Object} DipRuleItem
 * @property {string} id
 * @property {string} adapterId
 * @property {boolean} disabled
 * @property {Object} condition
 * @property {string} condition.accountId
 * @property {string} [condition.account]
 * @property {string} [condition.category]
 * @property {string} [condition.note]
 * @property {string} [condition.labels]
 * @property {string} [condition.description]
 * @property {number} [condition.amount]
 * @property {Object} action
 * @property {string} [action.description]
 * @property {string} [action.businessId]
 * @property {string} [action.categoryId]
 * @property {string} [action.tripDistance]
 * @property {Object} uiTextParts
 * @property {string} uiTextParts.condition
 * @property {string} uiTextParts.action
 */

export default class ImportRuleListModel {
  /** @type {DipRuleItem[]} */  items = []
  /** @type {?DipRuleItem} */  selectedItem
  /** @type {?DipRuleItem} */  editItem
  formErrors = {}
  selectedAdapter

  constructor () {
    makeAutoObservable(this)
    this.selectedAdapter = c.dipAdapters.all
  }

  /**
   *
   * @return {DipRuleItem}
   */
  getNewRule () {
    return {
      id: utils.getNewId(),
      adapterId: this.selectedAdapter.id,
      disabled: false,
      tripDistanceHidden: false,
      condition: {
        accountId: c.selectId.ALL,
        'Account Name': '',
        Category: '',
        Notes: '',
        Labels: '',
        description: '',
        Description: '',
        amount: 0
      },
      action: {
        accountId: '',
        description: '',
        businessId: '',
        categoryId: '',
        tripDistance: ''
      },
      uiTextParts: {
        condition: '',
        action: ''
      }
    }
  }

  get hasBusinesses () {
    return rootStore.masterDataStore.businesses.size > 0
  }

  /**
   * @param {DipRule} rule
   * @return {DipRuleItem}
   */
  getItemFromRule (rule) {
    const result = this.getNewRule()
    result.id = rule.id
    result.adapterId = rule.adapterId
    result.disabled = rule.disabled
    rule.conditions.forEach(x => result.condition[x.field] = x.value)
    rule.actions.forEach((value, key) => result.action[key] = value)
    result.uiTextParts = ImportRuleListModel.getRuleItemTextParts(rule)
    result.tripDistanceHidden = rootStore.masterDataStore.cars.length === 0
    return result
  }

  /**
   * Gets text for the rule to show in UI.
   * @param {DipRule} rule
   * @return {{condition: string, action: string}}
   */
  static getRuleItemTextParts (rule) {
    const adapterFieldMapping = fieldMapping[rule.adapterId]
    const conditions = rule.conditions.map(x => {
      const field = adapterFieldMapping[x.field] || x.field
      let value
      if (rule.adapterId === c.dipAdapters.mint.id) return `${x.field}: (${x.value})`
      if (field === 'Account' && x.value === c.selectId.ALL) return

      if (field === 'Account') value = rootStore.masterDataStore.accounts.get(x.value).shortName
      else if (isCurrency(x.value.toString()) && field === 'Amount') value = utils.formatAmount(x.value)
      else value = x.value
      return `${field}: (${value})`
    }).filter(x => Boolean(x))

    const actions = [...rule.actions.keys()].map(x => {
      const field = fieldMapping.all[x]
      let value
      const val = rule.actions.get(x)
      if (field === 'Category') value = rootStore.masterDataStore.categories.get(val).name
      else if (field === 'Account') {
        value = rootStore.masterDataStore.accounts.has(val)
          ? rootStore.masterDataStore.accounts.get(val).shortName
          : 'Closed or unknown account'
      } else if (field === 'Type') value = val === c.PERSONAL_TYPE_ID
        ? 'Personal' : rootStore.masterDataStore.businesses.get(val).nickname
      else if (field === 'Trip distance') value = `${val} ml`
      else if (isCurrency(val.toString())) value = utils.formatAmount(val)
      else value = val
      return `${field}: (${value})`
    })

    return { condition: conditions.join(', '), action: actions.join(', ') }
  }

  get tripDistanceHidden () {
    return rootStore.masterDataStore.cars.length === 0
  }

  getData = async () => {
    await rootStore.masterDataStore.getData()
    await rootStore.masterDataStore.getRules()

    const items = [...rootStore.masterDataStore.importRules.values()]
    this.items = items.filter(x => x.adapterId === this.selectedAdapter.id).map(x => this.getItemFromRule(x))

    if (this.items.length === 0) this.selectedItem = null
    else if (!this.selectedItem) this.selectedItem = this.items[0] || this.getNewRule()
    else this.setSelected(this.selectedItem.id)

    this.setEditItem()
  }

  setEditItem () {
    if (!Boolean(this.selectedItem)) {
      this.editItem = null
      return
    }
    this.editItem = { ...this.selectedItem }
    this.editItem.condition = { ...this.selectedItem.condition }
    this.editItem.action = { ...this.selectedItem.action }
  }

  handleChange = e => {
    const actionPrefix = 'action.'
    const target = e.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    let name = target.name
    if (name.substr(0, actionPrefix.length) === actionPrefix) {
      const fieldName = name.replace(actionPrefix, '')
      this.editItem.action[fieldName] = value
      if (fieldName === 'businessId') this.editItem.action.categoryId = c.selectId.NONE
    } else if (name === 'disabled') {
      this.editItem.disabled = Boolean(value)
    } else {
      this.editItem.condition[name] = value
    }
  }

  get formHidden () {
    return !this.editItem || !this.editItem.condition || !this.editItem.condition.accountId
  }

  get deleteButtonVisible () {
    return true
  }

  handleDelete = async () => {
    if (this.isNew) return Promise.resolve()

    this.selectedItem = null
    await rootStore.masterDataStore.deleteRule(this.editItem.id)
    await this.getData()
  }

  undoEdit = () => {
    if (this.isNew) this.selectedItem = this.items.length === 0 ? null : this.items[0]
    this.setEditItem()
  }

  handleAdapterChange = async e => {
    e.preventDefault()
    this.selectedAdapter = c.dipAdapters[e.target.id]
    await this.getData()
  }

  add = () => {
    this.editItem = this.getNewRule()
    this.selectedItem = null
  }

  /**
   */
  setSelected = e => {
    const id = typeof e === 'string' ? e : e.currentTarget.id
    this.selectedItem = this.items.find(x => x.id === id)
    if (!this.selectedItem) this.selectedItem = this.items.length > 0 ? this.items[0] : null
    this.setEditItem()
  }

  get isNew () {
    return this.selectedItem === null
  }

  save = async () => {
    this.formErrors = {}
    const rule = new DipRule(this.editItem.id)
    rule.disabled = this.editItem.disabled
    rule.adapterId = this.editItem.adapterId
    Object.keys(this.editItem.condition).forEach(x => rule.addCondition(x, this.editItem.condition[x]))
    Object.keys(this.editItem.action).forEach(x => rule.addActon(x, this.editItem.action[x]))

    this.formErrors = rule.validate()
    if (Object.keys(this.formErrors).length > 0) return Promise.resolve()

    const result = await rootStore.masterDataStore.saveRule(rule)
    if (result.errors) return this.formErrors = result.errors

    await this.getData()
    this.setSelected(result.id)
  }

  handleDescriptionChange = value => {
    if (value) this.editItem.action.description = value.description
  }

  /**
   * @return {SettingsListToolbarModel} }
   */
  get toolbarModel () {
    return {
      title: 'IMPORT RULES',
      add: this.add,
      getData: this.getData
    }
  }

}
