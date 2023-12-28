'use strict'

import { Adapter } from '../boaAgr-csv.js'
import DipRule from '../../../../shared/models/dipRule.js'
import { op } from '../../../../shared/models/condition.js'

const rowsHeader = `Status,Date,Original Description,Split Type,Category,Currency,Amount,User Description,Memo,Classification,Account Name,Simple Description`
const rows = [
`posted,12/22/2023, ORIG CO NAME:Square Inc             ORIG ID:xxxxxx0002 DESC DATE:xx1222 CO ENTRY DESCR:xx1222P2  SEC:CCD    TRACE#:xxxxxxxxxxx0826 EED:xx1222   IND ID:Lxxxxxxxx4618                IND NAME:Jane Doe                                                                                                Lx9531 TRN: 3xxxxx0826TC,,Transfers,USD,364.71, , ,Personal,BOA - Bank - BUS COMPLETE CHK, Transfer from Square`
]

const getRows = () => {
  const splitHeader = rowsHeader.split(',')
  return rows.map(x => {
    const row = {}
    const splitRow = x.split(',')
    splitHeader.forEach((y, i) => row[y] = splitRow[i])
    return row
  })
}

/**  */
describe('getRows', () => {
  it('should split data', () => {
    const rows = getRows()
    expect(rows[0]['Status']).toBe('posted')
  })
})

const tenantId = 'tId-01'
let transaction
let importAdapter

/**
 * importTransaction
 */
describe('importTransaction', () => {
  let transactions = []
  beforeAll(() => {
    transactions = getRows()
  })

  beforeEach(() => {
    transaction = Object.assign(transactions[0])
    importAdapter = new Adapter(tenantId, 'boaAgr-csv.csv', 'boa-agr', 'all', false)
  })

  it ('sets category for Business Service and Rda', () => {
    const dipRule = new DipRule('rule01', tenantId)
    dipRule.adapterId = 'boa-agr'
    dipRule.addCondition('Original Description', 'Square', op.INCL)
    dipRule.addActon('categoryId', 'cat01')
    dipRule.addActon('description', 'Square')
    importAdapter.rules = [dipRule]
    importAdapter.adapterRules = [dipRule]

    const actual = importAdapter.importTransaction(transaction)
    console.log({transaction, actual})
    expect(actual.categoryId).toBe('cat01')
  })

  it ('does not set category for Business Service and Costco', () => {
    transaction.Description = 'Costco'

    const actual = importAdapter.importTransaction(transaction)
    expect(actual.categoryId).toBeNull()
  })
})
