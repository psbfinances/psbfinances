'use strict'

import utils from '../utils.js'

describe('getSearchString', () => {
  it('returns empty string if value not defined', () => {
    const actual = utils.getSearchString()
    expect(actual).toBe('')
  })

  it('returns empty string if value is empty', () => {
    const actual = utils.getSearchString('   ')
    expect(actual).toBe('')
  })

  it('returns exact amount if number with decimals', () => {
    const actual = utils.getSearchString('35.23')
    expect(actual).toBe('amount=35.23')
  })

  it('returns amount range if number has no decimals', () => {
    const actual = utils.getSearchString('35')
    expect(actual).toBe('amount>=35&amount<=36')
  })

  it('returns description search if search is not number', () => {
    const actual = utils.getSearchString('Amazon')
    expect(actual).toBe('description=Amazon')
  })
})
