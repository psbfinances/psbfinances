'use strict'

import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import DuplicateListModel from './DuplicateListModel.js'
import ListToolbar from '../ListToolbar'
import { AmountTd } from '../../core/index.js'

const dateFormat = { month: 'short', day: 'numeric', year: 'numeric' }
const formatDate = date => new Date(date).toLocaleDateString('en-gb', dateFormat)

/**
 * Duplicate list.
 * @return {JSX.Element}
 * @constructor
 */
let DuplicateList = ({}) => {
  let model = new DuplicateListModel()
  return <DuplicateListComponent model={model} />
}
DuplicateList = observer(DuplicateList)
export default DuplicateList

/**
 * Duplicate list.
 */
let DuplicateListComponent = ({ model }) => {
  useEffect(async () => {await model.getData()}, [])

  return <div className='dataContainer'>
    <ListToolbar model={model.toolbarModel} />

    <div className='tableAndForm'>
      <DuplicatesTable model={model} />
    </div>
  </div>
}

/**
 *
 * @param {DuplicateListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let DuplicatesTable = ({ model }) => {
  return <div className='tbl'>
    <table id='duplicatesTable' data-testid='duplicatesTable' className='dataTable' aria-label='Duplicate Transactions'>
      <Header model={model} />
      <tbody>
        <Rows model={model} />
      </tbody>
    </table>
  </div>
}
DuplicatesTable = observer(DuplicatesTable)

/**
 * Table column header.
 * @return {JSX.Element}
 * @constructor
 */
let Header = ({}) => <thead>
  <tr className='sticky-top'>
    <th>Date</th>
    <th>Account</th>
    <th>Description</th>
    <th className='amountCol'>Amount</th>
    <th style={{width: '100px', textAlign: 'center'}}>Undo</th>
  </tr>
</thead>

/**
 * Table rows.
 * @param {DuplicateListModel} model
 * @return
 * @constructor
 */
let Rows = ({ model }) => {
  return model.items.length > 0 ? model.items.map(x => <Row key={x.id} item={x} model={model} />) : null
}
Rows = observer(Rows)

/**
 * Table row.
 * @param {Object} item
 * @param {DuplicateListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let Row = ({ item, model }) => {
  const amountClass = `amountCol ${item.amount < 0 ? 'text-danger' : 'text-success'}`

  return <tr>
    <td>{formatDate(item.postedDate)}</td>
    <td>{item.account}</td>
    <td>{item.description}</td>
    <AmountTd amount={item.amount} tdClass={amountClass} />
    <td className='text-center'>
      <i id={item.id} className='fas fa-undo' style={{color: '#B88766', cursor: 'pointer'}} onClick={model.handleUndo}/>
    </td>
  </tr>
}
Row = observer(Row)
