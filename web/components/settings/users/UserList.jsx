'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import UserListModel from './UserListModel'
import UserForm from './UserForm'
import ListToolbar from '../ListToolbar'

const model = new UserListModel()

/**
 * User list.
 * @return {JSX.Element}
 * @constructor
 */
const UserList = observer(({}) => <UserListComponent model={model} />)
export default UserList

/**
 * User list.
 */
class UserListComponent extends React.Component {
  async componentDidMount () {
    await model.getData()
  }

  render () {
    const { model } = this.props

    return <div className='dataContainer'>
      <ListToolbar model={model.toolbarModel} />

      <div className='tableAndForm'>
        <UsersTable model={model} />
        <UserForm model={model} />
      </div>
    </div>
  }
}

UserListComponent.propTypes = { model: UserListModel }

/**
 *
 * @param {UserListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let UsersTable = ({ model }) => {
  return <div className='tbl'>
    <table id='usersTable' data-testid='usersTable' className='dataTable' aria-label='Users'>
      <Header model={model} />
      <tbody>
        <Rows model={model} />
      </tbody>
    </table>
  </div>
}
UsersTable = observer(UsersTable)

/**
 * Table column header.
 * @return {JSX.Element}
 * @constructor
 */
let Header = ({}) => <thead>
  <tr className='sticky-top'>
    <th style={{ width: '200px' }}>Nickname</th>
    <th style={{ width: '300px' }}>Full name</th>
    <th style={{ width: '300px' }}>Email</th>
    <th style={{ width: '100px' }} className='text-center'>Has access</th>
  </tr>
</thead>

/**
 * Table rows.
 * @param {UserListModel} model
 * @return
 * @constructor
 */
let Rows = ({ model }) => {
  return model.items.length > 0 ? model.items.map(x => <Row key={x.id} item={x} model={model} />) : null
}
Rows = observer(Rows)

/**
 * Table row.
 * @param {User} item
 * @param {UserListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let Row = ({ item, model }) => {
  const getIcon = value => Boolean(value) ? <i className='fas fa-check-circle' /> : ''

  const selectedClass = model.selectedItem && item.id === model.selectedItem.id ? 'selectedTableRow' : ''

  return <tr id={item.id} onClick={model.setSelected} className={selectedClass}>
    <td>{item.nickname}</td>
    <td>{item.fullName}</td>
    <td>{item.email}</td>
    <td className='text-center'>{getIcon(item.hasAccess)}</td>
  </tr>
}
Row = observer(Row)
