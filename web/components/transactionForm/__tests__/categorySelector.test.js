'use strict'

import * as React from 'react'
import '@testing-library/jest-dom/extend-expect'
import CategoryOptions from '../CategoryOptions.js'

/**
 * @jest-environment jsdom
 */
/**
 * getCategoryOptions
 */
describe('getCategoryOptions', () => {
  const emptyBusinessId = null
  const emptyCategoryId = null
  const businessId = 'b1'
  const businessCategoryId = '555'
  const personalBusinessId = 'p'
  const personalCategoryId = '11'

  it('returns personal options for personal transaction', () => {
    const categorySelector = new CategoryOptions(categories)
    const actual = categorySelector.getOptions(personalCategoryId, personalBusinessId)

    expect(actual).toStrictEqual(personalCategories)
  })

  it('returns business options for business transaction', () => {
    const categorySelector = new CategoryOptions(categories)
    const actual = categorySelector.getOptions(businessCategoryId, businessId)

    expect(actual).toStrictEqual(businessCategories)
  })

  it('returns nothing for empty business and category transaction', () => {
    const categorySelector = new CategoryOptions(categories)
    const actual = categorySelector.getOptions(emptyCategoryId, emptyBusinessId)

    expect(actual).toStrictEqual(emptyCategory)
  })

  it('returns personal for personal and empty category transaction', () => {
    const categorySelector = new CategoryOptions(categories)
    const actual = categorySelector.getOptions(emptyCategoryId, personalBusinessId)

    expect(actual).toStrictEqual(personalCategories)
  })

  it('returns personal for empty business and personal category', () => {
    const categorySelector = new CategoryOptions(categories)
    const actual = categorySelector.getOptions(personalCategoryId, emptyBusinessId)

    expect(actual).toStrictEqual(personalCategories)
  })

  it('returns business for empty business and business category', () => {
    const categorySelector = new CategoryOptions(categories)
    const actual = categorySelector.getOptions(businessCategoryId, emptyBusinessId)

    expect(actual).toStrictEqual(businessCategories)
  })
})

const categories = [
  { id: '11', isPersonal: 1, name: 'Food' },
  { id: '22', isPersonal: 1, name: 'Shopping' },
  { id: '33', isPersonal: 1, name: 'Utilities' },
  { id: '555', isPersonal: 0, name: 'Rent' },
  { id: '666', isPersonal: 0, name: 'Office Expenses' }
]

const emptyCategory = [{ value: '-1', isPersonal: 1, label: '' }]
const personalCategories = emptyCategory.concat(categories.
  filter(x => x.isPersonal === 1).
  map(x => ({ value: x.id, label: x.name, isPersonal: x.isPersonal })))
const businessCategories = emptyCategory.concat(categories.
  filter(x => x.isPersonal !== 1).
  map(x => ({ value: x.id, label: x.name, isPersonal: x.isPersonal })))
