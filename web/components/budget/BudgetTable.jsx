'use strict'

import React from 'react'
import { td } from '../core/index.js'
import numeral from 'numeral'
import { observer } from 'mobx-react'
import classNames from 'classnames'

const BudgetTable = observer(
class BudgetTable extends React.Component {

  render () {
    const model = this.props.model
    console.log(model.formVisible)
    return <div className='tbl'>
      <table id='budgetTable' data-testid='budgetTable' className='dataTable' aria-label='Budget'>
        <Header model={this.props.model} />
        <tbody>
          <Row model={this.props.model} item={this.props.model.total} />
          <Rows model={this.props.model} />
        </tbody>
      </table>
    </div>
  }
})
export default BudgetTable

let Header = ({ model }) => <thead>
  <tr className='sticky-top'>
    <th className='categoryCol'>Category</th>
    <th className='amountCol'>Total</th>
    {!model.formVisible && <th className='amountColBudget'>Jan</th>}
    {!model.formVisible && <th className='amountColBudget'>Feb</th>}
    {!model.formVisible && <th className='amountColBudget'>Mar</th>}
    {!model.formVisible && <th className='amountColBudget'>Apr</th>}
    {!model.formVisible && <th className='amountColBudget'>May</th>}
    {!model.formVisible && <th className='amountColBudget'>Jun</th>}
    {!model.formVisible && <th className='amountColBudget'>Jul</th>}
    {!model.formVisible && <th className='amountColBudget'>Aug</th>}
    {!model.formVisible && <th className='amountColBudget'>Sep</th>}
    {!model.formVisible && <th className='amountColBudget'>Oct</th>}
    {!model.formVisible && <th className='amountColBudget'>Nov</th>}
    {!model.formVisible && <th className='amountColBudget'>Dec</th>}
  </tr>
</thead>
Header = observer(Header)

let Rows = ({ model }) => {
  return model.items.map(x => <Row key={x.id} item={x} model={model} />)
}
Rows = observer(Rows)


const formatCurrency = amount => numeral(amount).format('0,0')

let Row = ({ item, model }) => {
  function handleRowClick () {
    if (item.id !== 'total') model.setFormVisible(true)
  }

  const isTotal = item.id === 'total'
  const cN = classNames(['text-right', 'corn', {budgetTotal: isTotal}])
  const cN1 = classNames(['truncate',  'categoryCol', {budgetTotal: isTotal}])

  return <tr id={item.id} onClick={handleRowClick}>
    <td className={cN1}>{item.category}</td>
    <td className={cN} >{formatCurrency(item.total)}</td>
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className={cN}>{formatCurrency(item.amount)}</td>}
  </tr>
}
Row = observer(Row)
