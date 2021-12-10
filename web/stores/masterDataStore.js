'use strict'

import { makeAutoObservable } from 'mobx'
import * as api from '../../shared/apiClient/index.js'
import { c, utils } from '../../shared/core/index.js'
import CategoryOptions from '../components/transactionForm/categoryOptions.js'
import DipRule from '../../shared/models/dipRule.js'

/** @type {SelectOption[]} */
const emptyBusinessOptions = [
  { value: c.selectId.NONE, label: '' },
  { value: c.PERSONAL_TYPE_ID, label: 'Personal' }
]

/**
 * Master data store.
 * @description accounts, categories, businesses, ...
 */
export default class MasterDataStore {
  /** @type {rootStore} */ rootStore
  loading = false
  loaded = false
  /** @type {Map<string, psbf.Category>} */
  categories
  /** @type {Map<string, FinancialAccount>} */
  accounts
  /** @type {Map<string, Business>} */
  businesses
  /** @type {Map<string, User>} */
  users
  /** @type {Map<string, DipRule>} */
  importRules
  /** @type {Map<string, Car>} */
  cars

  constructor (rootStore) {
    makeAutoObservable(this)
    this.rootStore = rootStore
    this.loading = true
  }

  /**
   * Gets master data.
   * @param {boolean} reload = false - whether data should be reloaded
   * @return
   */
  * getData (reload = false) {
    if (this.loaded && !reload) return Promise.resolve()

    this.loading = true
    yield this.getAccounts(true)
    yield this.getCategories()
    yield this.getBusinesses()
    yield this.getCars()
    this.loading = false
    this.loaded = true
  }

  * getRules () {
    const rules = yield api.importRuleApi.list()
    this.importRules = new Map([...rules].map(x => {
      const rule = x
      const result = new DipRule(rule.id)
      result.adapterId = x.adapterId
      result.conditions = JSON.parse(rule.conditions)
      result.actions = new Map(JSON.parse(rule.actions))

      result.disabled = Boolean(rule.disabled)
      return [x.id, result]
    }))
  }

  * getAccounts (visibleOnly = true) {
    let accounts = yield api.accountApi.list()
    if (visibleOnly) accounts = accounts.filter(x => Boolean(x.visible))
    this.accounts = new Map([...accounts].map(x => [x.id, x]))
  }

  /**
   * Gets account.
   * @param {string} id
   * @param {number} [currentBalance]
   * @return {Promise<FinancialAccount>}
   */
  * getAccount (id, currentBalance) {
    return currentBalance !== undefined
      ? yield api.accountApi.get(id, {currentBalance})
      : yield api.accountApi.get(id)
  }

  * getCategories () {
    const categories = yield api.categoryApi.list()
    this.categories = new Map(categories.map(x => [x.id, x]))
  }

  * getBusinesses () {
    const businesses = yield api.businessApi.list()
    this.businesses = new Map(businesses.map(x => [x.id, x]))
  }

  * getCars () {
    const cars = yield api.carApi.list()
    this.cars = new Map(cars.map(x => [x.id, x]))
  }

  * getUsers () {
    const users = yield api.userApi.list()
    this.users = new Map([...users].map(x => [x.id, x]))
  }

  get accountOptions () {
    return [allAccountsOption, ...[...this.accounts.values()].filter(x => x.visible).sort(x => x.isDefault ? -1 : 1)]
  }

  * saveAccount (account) {
    return utils.isNewId(account.id)
      ? yield api.accountApi.post(account)
      : yield api.accountApi.put(account.id, account)
  }

  * saveUser (user) {
    return utils.isNewId(user.id)
      ? yield api.userApi.post(user)
      : yield api.userApi.put(user.id, user)
  }

  * saveBusiness (business) {
    return utils.isNewId(business.id)
      ? yield api.businessApi.post(business)
      : yield api.businessApi.put(business.id, business)
  }

  * saveCategory (category) {
    return utils.isNewId(category.id)
      ? yield api.categoryApi.post(category)
      : yield api.categoryApi.put(category.id, category)
  }

  * saveCar (car) {
    return utils.isNewId(car.id) ? yield api.carApi.post(car) : yield api.carApi.put(car.id, car)
  }

  * saveRule (data) {
    const apiData = { ...data }
    apiData.actions = [...data.actions.entries()]
    return utils.isNewId(data.id)
      ? yield api.importRuleApi.post(apiData)
      : yield api.importRuleApi.put(data.id, apiData)
  }

  * deleteRule (id) {
    yield api.importRuleApi.delete(id)
  }

  setData (accounts, categories, businesses, cars) {
    this.accounts = new Map([allAccountsOption, ...accounts].map(x => [x.id, x]))
    this.categories = new Map(categories.map(x => [x.id, x]))
    this.businesses = new Map(businesses.map(x => [x.id, x]))
    this.cars = new Map(cars.map(x => [x.id, x]))
    this.importRules = new Map()
  }

  get hasCars () {
    return this.cars.size > 0
  }

  /**
   * @return {FinancialAccount}
   */
  get firstAccount () {
    return this.accountOptions[1]
  }

  get categoryOptions () {
    return this.categories ? new CategoryOptions([...this.categories.values()]) : null
  }

  get businessOptions () {
    return this.businesses
      ? emptyBusinessOptions.concat([...this.businesses.values()].map(x => ({ value: x.id, label: x.nickname })))
      : null
  }

  get hasBusinesses () {
    return this.businesses && this.businesses.size > 0
  }

  /**
   * @return {psbf.Category}
   */
  get firstCategory () {
    const values = this.categories.values()
    values.next()
    return values.next().value
  }

  get hasAccounts () {
    return this.accounts.size > 0
  }
}

/** @type {psbf.Category} */
export const allCategories = {
  id: 'all',
  isPersonal: 1,
  name: 'All categories',
  type: 't'
}

/**
 *
 * @type {FinancialAccount}
 */
export const allAccountsOption = {
  balance: 0,
  bankId: null,
  businessId: null,
  closed: 0,
  deleted: 0,
  fullName: 'All Accounts',
  id: c.selectId.ALL,
  isDefault: 0,
  openingBalance: 0,
  shortName: 'All accounts',
  visible: 1,
  format: null
}
