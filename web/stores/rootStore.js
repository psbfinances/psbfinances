'use strict'

import { makeAutoObservable } from 'mobx'
import MasterDataStore from './masterDataStore.js'
import { TransactionsStore } from './transactionsStore.js'

/**
 * Root data store.
 */
export class RootStore {
  /** @type {MasterDataStore} */ masterDataStore
  /** @type {TransactionsStore} */ transactionsStore

  constructor () {
    makeAutoObservable(this)
    this.init()
  }

  init () {
    this.masterDataStore = new MasterDataStore(this)
    this.transactionsStore = new TransactionsStore(this)
  }
}

export const rootStore = new RootStore()
