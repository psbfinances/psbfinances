'use strict'

import ImportRuleListModel from '../ImportRuleListModel.js'
import DipRule from '../../../../../shared/models/dipRule.js'
import { setupRootStore } from '../../../__tests__/helper.js'

/** getRuleItemTextParts */
describe('getRuleItemTextParts', () => {
  it('returns for mint rule', async () => {
    await setupRootStore()
    const ruleString = '{"id":"cktxcjizw000491cud12gc06a","adapterId":"mint","conditions":"[{\\"field\\": \\"Account Name\\", \\"value\\": \\"CHK LLC\\", \\"condition\\": \\"=\\"}]","actions":"[[\\"accountId\\", \\"acc-01\\"]]","disabled":0}'
    const rule = DipRule.parse(ruleString)
    rule.adapterId = 'mint'

    const actual = ImportRuleListModel.getRuleItemTextParts(rule)
    expect(actual).toStrictEqual({
      action: 'Account: (Checking Main)',
      condition: 'Account Name: (CHK LLC)'
    })
  })
})
