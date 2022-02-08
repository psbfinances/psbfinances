'use strict'

import React from 'react'
import numeral from 'numeral'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import { c } from '@psbfinances/shared/core/index.js'

const formatCurrency = amount => numeral(amount).format('0,0')

/**
 * Budget table.
 * @param {BudgetModel} model
 */
const BudgetTable = observer(({ model }) => {
  return <div className='tbl'>
    <table id='budgetTable' data-testid='budgetTable' className='dataTable' aria-label='Budget'>
      <Header model={model} />
      <tbody>
        <TotalRow model={model} item={model.totals} />
        <Rows model={model} />
      </tbody>
    </table>
  </div>
})
export default BudgetTable

/**
 * Table header.
 * @param {BudgetModel} model
 */
const Header = observer(({ model }) => <thead>
    <tr className='sticky-top'>
      <th className='categoryCol'>Category</th>
      <th className='amountCol budgetTotal'>Total</th>
      {!model.formVisible && c.months.map(x => <th key={x} className='amountColBudget'>{x}</th>)}
    </tr>
  </thead>
)

/**
 * Table rows
 * @param {BudgetModel} model
 * @constructor
 */
const Rows = observer(({ model }) => {
  return model.items.map(x => <Row key={x.categoryId} item={x} model={model} />)
})

/**
 * Table row.
 * {@link module:psbf/api/budget}
 * @param {CategoryAmount} item
 * @param {BudgetModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
const Row = observer(({ item, model }) => {
  if (!item) return null

  const handleRowClick = e => {
    if (!Boolean(item.categoryId)) return

    model.selectedId = e.currentTarget.id
    model.setFormVisible(true)

  }

  const hasNote = (note, amount) => (Boolean(note) && amount > 0)
  if (!model.showZerros && item.amounts[0].amount === 0) return null

  return <tr id={item.categoryId} onClick={handleRowClick}>
    <td className='truncate categoryCol'>{item.categoryName}</td>
    {model.formVisible
      ? <td key={`${item.categoryId}-0`} className='text-right budgetTotal'>{formatCurrency(
        item.amounts[0].amount)}</td>
      : item.amounts.map((x, i) => <td
        key={`${item.categoryId}-${i}`}
        className={classNames(['text-right', { budgetTotal: i === 0 }, { corn: hasNote(x.note, x.amount) }])}>
        {formatCurrency(x.amount)}
      </td>)}
  </tr>
})

/**
 * Totals row.
 * {@link module:psbf/api/budget}
 * @param {{amounts: Number[]}} item
 * @param {BudgetModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
let TotalRow = ({ item, model }) => {
  if (item.amounts.length === 0) return null

  const classes = 'text-right font-weight-bold border-bottom'

  return <tr id='total'>
    <td className='budgetTotal font-weight-bold border-bottom'>Total</td>
    {model.formVisible
      ? <td key={`total-${0}`} className={classes}>{formatCurrency(item.amounts[0])}</td>
      : item.amounts.map((x, i) => <td key={`total-${i}`} className={classes}>{formatCurrency(x)}</td>)
    }
  </tr>
}
TotalRow = observer(TotalRow)
