'use strict'

import { accountsViewModel, formFields } from './accountsViewModel.js'
import {it, describe} from 'node:test'
import * as assert from 'node:assert'

describe('handleChange', () => {
  it('changes full name field', () => {
    /**
     * @type {FinancialAccount}
     */
    const account = {
      fullName: 'Original name'
    }
    const expected = 'new full name';
    /**
     * @type {HTMLInputElement}
     */
    const changeTarget = {
      type: 'text',
      name: formFields.fullName.id,
      value: expected
    }
    const actual = accountsViewModel.handleChange(changeTarget, account);
    assert.strictEqual(actual.fullName, expected);
  })
})
