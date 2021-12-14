'use strict'

import React from 'react'
import { td } from '../core/index.js'
import numeral from 'numeral'
import { observer } from 'mobx-react'

const BudgetTable = observer(
class BudgetTable extends React.Component {

  render () {
    const model = this.props.model
    console.log(model.formVisible)
    return <div className='tbl'>
      <table id='budgetTable' data-testid='budgetTable' className='dataTable' aria-label='Budget'>
        <Header model={this.props.model} />
        <tbody>
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
    {!model.formVisible && <th className='amountCol'>Jan</th>}
    {!model.formVisible && <th className='amountCol'>Jan</th>}
    {!model.formVisible && <th className='amountCol'>Jan</th>}
    {!model.formVisible && <th className='amountCol'>Jan</th>}
    {!model.formVisible && <th className='amountCol'>Jan</th>}
    {!model.formVisible && <th className='amountCol'>Jan</th>}
    {!model.formVisible && <th className='amountCol'>Jan</th>}
    {!model.formVisible && <th className='amountCol'>Jan</th>}
    {!model.formVisible && <th className='amountCol'>Jan</th>}
    {!model.formVisible && <th className='amountCol'>Jan</th>}
    {!model.formVisible && <th className='amountCol'>Jan</th>}
    {!model.formVisible && <th className='amountCol'>Jan</th>}
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
    model.setFormVisible(true)
  }

  return <tr id={item.id} onClick={handleRowClick}>
    <td className='truncate categoryCol'>{item.category}</td>
    <td className='text-right'>{formatCurrency(item.total)}</td>
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
    {!model.formVisible && <td className='text-right'>{formatCurrency(item.amount)}</td>}
  </tr>
}
Row = observer(Row)
