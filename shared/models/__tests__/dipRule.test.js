'use strict'

import DipRule, { field } from '../dipRule.js'
import Condition, { op } from '../condition.js'
import { transactionModel } from '../index.js'
import cuid from 'cuid'

/** transform */
describe('transform', () => {
  const id = 'id-01'
  const accountId = 'acId-01'
  const businessId = 'busId-01'
  let mintTransaction = {}
  let transaction = transactionModel.getNew(accountId)
  let rule = new DipRule(id)

  beforeEach(() => {
    mintTransaction = {}
    transaction = transactionModel.getNew(accountId)
    transaction.id = cuid()
    rule = new DipRule(id)
    rule.adapterId = 'all'
  })

  it('maps account', () => {
    rule.adapterId = 'mint'

    const mintTransaction = { 'Account Name': 'Visa Costco' }
    rule.conditions = [
      new Condition('Account Name', 'Visa Costco')
    ]
    rule.actions.set(field.accountId, accountId)

    const actual = rule.transform(transaction, mintTransaction)

    expect(actual.modified).toBeTruthy()
    expect(actual.transaction.id).toBe(transaction.id)
    expect(actual.transaction.accountId).toBe(accountId)
  })

  it('maps account and business', () => {
    rule.adapterId = 'mint'
    const mintTransaction = {
      'Account Name': 'Citi® Dividend World Elite® MasterCard®',
      'Category': 'Business Services'
    }
    rule.conditions = [
      new Condition('Account Name', 'Citi® Dividend World Elite® MasterCard®'),
      new Condition('Category', 'Business Services')
    ]
    rule.actions.set(field.accountId, accountId)
    rule.actions.set(field.businessId, businessId)

    const actual = rule.transform(transaction, mintTransaction)

    expect(actual.modified).toBeTruthy()
    expect(actual.transaction.id).toBe(transaction.id)
    expect(actual.transaction.accountId).toBe(accountId)
    expect(actual.transaction.businessId).toBe(businessId)
  })

  it('maps check', () => {
    const accountId1 = 'creditCardAccountId'
    const businessId1 = 'salonBusinessId'
    const categoryId = 'suppliesCategoryId'
    const description = 'The Salon'

    transaction.accountId = accountId1
    transaction.description = 'CHECK 350'
    transaction.amount = -32500
    rule.conditions = [
      new Condition(field.accountId, accountId1),
      new Condition(field.description, 'check', op.INCL),
      new Condition(field.amount, 325)
    ]
    rule.actions.set(field.businessId, businessId1)
    rule.actions.set(field.description, description)
    rule.actions.set(field.categoryId, categoryId)

    const actual = rule.transform(transaction)

    expect(actual.modified).toBeTruthy()
    expect(actual.transaction.id).toBe(transaction.id)
    expect(actual.transaction.accountId).toBe(accountId1)
    expect(actual.transaction.businessId).toBe(businessId1)
    expect(actual.transaction.description).toBe(description)
  })
})

/** toString */
describe.skip('toString', () => {
  it('converts two conditions', () => {
    const rule = new DipRule('id1', 't1')
    rule.addCondition('categoryId', 'Shopping')
    rule.addCondition('amount', '200')

    const actual = rule.toString()
    expect(actual).toStrictEqual({ conditions: 'Category: (Shopping), Amount: ($200.00)', doThis: '' })
  })

  it('converts two actions', () => {
    const rule = new DipRule('id1', 't1')
    // rule.addCondition('categoryId', 'Shopping')
    // rule.addCondition('amount', '200')
    rule.addActon('categoryId', 'Shopping')
    rule.addActon('description', 'Amazon')
    const actual = rule.toString()
    expect(actual).toStrictEqual({ conditions: '', doThis: 'Category: (Shopping), Description: (Amazon)' })
  })
})

/** toDb */
describe.skip('toDb', () => {
  it('returns values to store in db', () => {
    const rule = new DipRule('id1')
    rule.addCondition('categoryId', 'Shopping')
    rule.addCondition('amount', '200')
    rule.addActon('categoryId', 'Shopping')
    rule.addActon('description', 'Amazon')

    const actual = rule.toDb()
    expect(actual).toStrictEqual({
      id: 'id1',
      disabled: false,
      conditions:
        '[{"field":"categoryId","condition":"=","value":"Shopping"},{"field":"amount","condition":"=","value":"200"}]',
      toMap: '[["categoryId","Shopping"],["description","Amazon"]]'
    })
  })
})

/** fromDb */
describe.skip('fromDb', () => {
  it('converts db data to rule', () => {
    const dbData = [{
      id: 'id1',
      disabled: 0,
      conditions:
        '[{"field":"categoryId","condition":"=","value":"Shopping"},{"field":"amount","condition":"=","value":"200"}]',
      actions: '[["categoryId","Shopping"],["description","Amazon"]]'
    }]

    const actual = DipRule.fromDb(dbData)

    expect(actual.id).toBe('id1')
    expect(actual.disabled).toBeFalsy()
    expect(actual.conditions).toHaveLength(2)
    expect(actual.actions.size).toBe(2)
  })
})

/** fromData */
describe('fromData', () => {
  const conditionsString = '[{"field":"categoryId","condition":"=","value":"Shopping"},{"field":"amount","condition":"=","value":"200"}]'
  const actionsString = '[["categoryId","Shopping"],["description","Amazon"]]'
  it('assigns data to the class properties', () => {
    const data = {
      id: 'id01',
      adapterId: 'mint',
      conditions: JSON.parse(conditionsString),
      actions: new Map(JSON.parse(actionsString)),
      disabled: false
    }

    const actual = DipRule.fromData(data)
    expect(actual).toBeInstanceOf(DipRule)
  })
})

