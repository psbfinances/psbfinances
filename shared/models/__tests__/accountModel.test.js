'use strict'

import accountModel from '../accountModel.js'

/** validate */
describe('validate', () => {
  it('returns size error if short name is too long', () => {
    /** @type {FinancialAccount} */
    const account = {shortName: 'name-that-longer-than-25-char', fullName: 'account full name'}
    const actual = accountModel.validate(account)
    console.log(actual.shortName)
    expect(actual.shortName).not.toBeUndefined()
  })
})
