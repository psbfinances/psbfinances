'use strict'

import { rootStore } from '../../stores/rootStore'
import { amazonCardTransactions, businesses, categories, cars, accounts } from './data'

export const setupRootStore = async () => {
  rootStore.masterDataStore.setData(accounts, categories, businesses, cars)
  await rootStore.transactionsStore.setItems(amazonCardTransactions, 10)
}

describe('fake test', () => {
  it('always passes', () => {
    expect(true).toBeTruthy()
  })
})

