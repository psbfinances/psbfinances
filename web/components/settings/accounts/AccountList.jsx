'use strict'

import React, { useEffect } from 'react'
import { AmountTd } from '../../core'
import { observer } from 'mobx-react'
import AccountForm from './AccountForm'
import AccountListModel from './AccountListModel'
import ListToolbar from '../ListToolbar'

/**
 * Account list.
 * @return {JSX.Element}
 * @constructor
 */
let AccountList = ({}) => {
  let model = new AccountListModel()
  return <AccountListComponent model={model} />
}
AccountList = observer(AccountList)
export default AccountList

/**
 * Account list.
 */
let AccountListComponent = ({ model }) => {
  useEffect(async () => {await model.getData()}, [])

  return <div className='dataContainer'>
    <ListToolbar model={model.toolbarModel} />

    <div className='tableAndForm'>
      <AccountsTable model={model} />
      <AccountForm model={model} />
    </div>
  </div>
}

/**
 *
 * @param {AccountListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let AccountsTable = ({ model }) => {
  return <div className='tbl'>
    <table id='accountTable' data-testid='accountsTable' className='dataTable' aria-label='Accounts'>
      <Header model={model} />
      <tbody>
        <Rows model={model} />
      </tbody>
    </table>
  </div>
}
AccountsTable = observer(AccountsTable)

/**
 * Table column header.
 * @return {JSX.Element}
 * @constructor
 */
let Header = ({}) => <thead>
  <tr className='sticky-top'>
    <th style={{ width: '200px' }}>Short name</th>
    <th style={{ width: '300px' }}>Full name</th>
    <th className='otherCol'>Type</th>
    <th className='text-right'>Opening balance</th>
    <th className='text-center otherCol'>Default</th>
    <th className='text-center otherCol'>Closed</th>
    <th className='text-center otherCol'>Visible</th>
  </tr>
</thead>

/**
 * Table rows.
 * @param {AccountListModel} model
 * @return
 * @constructor
 */
let Rows = ({ model }) => {
  return model.items.length > 0 ? model.items.map(x => <Row key={x.id} item={x} model={model} />) : null
}
Rows = observer(Rows)

/**
 * Table row.
 * @param {FinancialAccount} item
 * @param {AccountListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let Row = ({ item, model }) => {
  const getIcon = value => Boolean(value) ? <i className='fas fa-check-circle' /> : ''

  const selectedClass = model.selectedItem && item.id === model.selectedItem.id ? 'selectedTableRow' : ''

  return <tr id={item.id} onClick={model.setSelected} className={selectedClass}>
    <td>{item.shortName}</td>
    <td>{item.fullName}</td>
    <td>{item.type}</td>
    <AmountTd amount={item.openingBalance} />
    <td className='text-center'>{getIcon(item.isDefault)}</td>
    <td className='text-center'>{getIcon(item.closed)}</td>
    <td className='text-center'>{getIcon(item.visible)}</td>
  </tr>
}
Row = observer(Row)
