'use strict'

import { AmountTd } from '../../core'
import { observer } from 'mobx-react'
import AccountForm from './AccountForm'
import AccountListModel from './AccountListModel'
import ListToolbar from '../ListToolbar'
import React from 'react'

/**
 * Account list.
 * @return {JSX.Element}
 * @constructor
 */
let model = new AccountListModel()

const AccountList = observer(({}) => <AccountListComponent model={model} />)
export default AccountList

/**
 * Account list.
 */
class AccountListComponent extends React.Component {
  async componentDidMount () {
    await model.getData()
  }

  render () {
    const { model } = this.props

    return <div className='dataContainer'>
      <ListToolbar model={model.toolbarModel} />

      <div className='tableAndForm'>
        <AccountsTable model={model} />
        <AccountForm model={model} />
      </div>
    </div>
  }
}

AccountListComponent.propTypes = { model: AccountListModel }

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
    <th style={{ width: '150px' }}>Type</th>
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
