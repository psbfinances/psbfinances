'use strict'

import { rootStore } from '../../stores/rootStore.js'

export const setTransactionListFilter = searchParams => {
  rootStore.transactionsStore.filter.reset()
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  if (year) rootStore.transactionsStore.filter.year = year
  if (month) rootStore.transactionsStore.filter.month = month
}

export const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
export const formatterP = new Intl.NumberFormat('en-US',
  { style: 'percent', maximumFractionDigits: 2, minimumFractionDigits: 0 })
export const dateFormat = { month: 'short', day: 'numeric' }
