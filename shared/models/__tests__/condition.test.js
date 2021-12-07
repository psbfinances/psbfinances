'use strict'

import Condition, { op } from '../condition.js'

/** matched */
describe('matched', () => {
  it('matches account', () => {
    const mintTransaction = {
      'Account Name': 'Visa Costco'
    }
    const condition = new Condition('Account Name', 'Visa Costco')

    const actual = condition.matched(mintTransaction)
    expect(actual).toBeTruthy()
  })

  it('matches category', () => {
    const mintTransaction = {
      'Category': 'Groceries'
    }
    const condition = new Condition('Category', 'Groceries')

    const actual = condition.matched(mintTransaction)
    expect(actual).toBeTruthy()
  })

  it('matches amount', () => {
    const mintTransaction = {
      'Amount': '123.45'
    }
    const condition = new Condition('Amount', 123.45)

    const actual = condition.matched(mintTransaction)
    expect(actual).toBeTruthy()
  })

  it('matches description', () => {
    const mintTransaction = {
      'Description': 'RDA Pro Market'
    }
    const condition = new Condition('Description', 'rda', op.INCL)

    const actual = condition.matched(mintTransaction)
    expect(actual).toBeTruthy()
  })
})
