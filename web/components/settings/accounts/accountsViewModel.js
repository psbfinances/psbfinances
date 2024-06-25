'use strict'

import { accountModel } from '../../../../shared/models/index.js'
import { utils } from '../../../../shared/core/index.js'
import { accountsFetchApi } from '@psbfinances/shared/apiClient/fetchApi.js'
import * as api from '@psbfinances/shared/apiClient/index.js'

export const formFields = {
  shortName: { id: 'shortName', label: 'Short name' },
  fullName: { id: 'fullName', label: 'Long name name' }
}
export const accountsViewModel = {
  getData: async () => {
    return accountsFetchApi.list()
  },

  calculateOpeningBalance: async (currentBalance) => {
    const result = await api.accountApi.get(this.state.editItem.id, { currentBalance })
    return result.openingBalance
  },

  /**
   *
   * @param {HTMLInputElement} target
   * @param {FinancialAccount} editItem
   * @return {FinancialAccount}
   */
  handleChange: (target, editItem) => {
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    const updatedItem = { ...editItem }
    if (name.includes('meta')) {
      if (!updatedItem.meta) updatedItem.meta = {}
      updatedItem.meta[name.replace('meta.', '')] = value
    } else {
      updatedItem[name] = value
    }
    return updatedItem
  },

  /**
   *
   * @param {FinancialAccount} account
   * @return {Promise<{items?: FinancialAccount[], selectedId?: string, errors?: Object}>}
   */
  save: async (account) => {
    const errors = accountModel.validate(account)
    if (utils.hasError(errors)) return Promise.resolve({ errors })

    try {
      /** @type {FinancialAccount|{errors: {}}} */
      const saveResult = utils.isNewId(account.id)
        ? await api.accountApi.post(account)
        : await api.accountApi.put(account.id, account)

      return saveResult.errors
        ? { selectedId: account.id, errors: saveResult.errors }
        : { selectedId: saveResult.id, errors: {} }
      // return saveResult.errors ? { errors } : {selectedId: saveResult.id}
    } catch (err) {
      return { errors: { formError: 'Something went wrong' } }
    }
  }
}
