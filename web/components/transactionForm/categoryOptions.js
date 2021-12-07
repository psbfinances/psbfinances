'use strict'

import { c } from '../../../shared/core/index.js'

/** @type {SelectOption[]} */
const emptyCategory = [{ value: '-1', isPersonal: 1, label: '' }]

/**
 * Category options builder.
 */
export default class CategoryOptions {
  categories
  personalCategories
  businessCategories

  constructor (categories) {
    this.categories = categories
    this.personalCategories = categories.filter(x => x.isPersonal === 1).map(x => ({ value: x.id, label: x.name, isPersonal: x.isPersonal }))
    this.businessCategories = categories.filter(x => x.isPersonal === 0).map(x => ({ value: x.id, label: x.name, isPersonal: x.isPersonal }))
  }

  getOptions (categoryId, businessId) {
    if (businessId === '-1') return emptyCategory

    if (businessId !== null) {
      const categoryOptions = businessId === c.PERSONAL_TYPE_ID ? this.personalCategories : this.businessCategories
      return emptyCategory.concat(categoryOptions)
    } else {
      if (categoryId === null) {
        return emptyCategory
      } else {
        const category = this.categories.find(x => x.id === categoryId)
        const categoryOptions = category.isPersonal ? this.personalCategories : this.businessCategories
        return emptyCategory.concat(categoryOptions)
      }
    }
  }
}
