'use strict'

import { AmountTd } from '../../core'
import {accountsViewModel} from './accountsViewModel'
import React, { memo } from 'react'
import { AccountForm } from './AccountForm.jsx'
import ListToolbar from '../ListToolbar.jsx'

/**
 * Account list.
 */
export class Accounts extends React.Component {
  state = {
    items: [],
    selectedId: null,
    selectedItem: null
  }

  constructor (props) {
    super(props)
    this.toolbar = {
      title: 'ACCOUNTS',
      add: this.add,
      getData: this.getData
    }
    this.myRef = React.createRef()
  }

  add = async () => {

  }

  getData = async () => {
    const items = await accountsViewModel.getData()
    this.myRef.current.scrollIntoView()
    this.setState({ items, selectedId: items[0].id, selectedItem: items[0] })
  }

  async componentDidMount () {
    await this.getData()
  }

  handleRowClick = e => {
    const selectedId = e.target.parentNode.id
    if (selectedId === this.state.selectedId) return

    const selectedItem = this.state.items.find(x => x.id === selectedId)
    this.setState({ selectedId, selectedItem })
  }

  handleSave = async id => {
    const items = await accountsViewModel.getData()
    this.setState({ items, selectedId: id, selectedItem: items.find(x => x.id === id) })
  }

  render () {
    return <div className='dataContainer'>
      <ListToolbar model={this.toolbar} />

      <div className='tableAndForm'>
        <AccountsTable
          items={this.state.items}
          myRef={this.myRef}
          selectedId={this.state.selectedId}
          onClick={this.handleRowClick} />
        <AccountForm
          selectedItem={this.state.selectedItem}
          handleSave={this.handleSave}
        />
      </div>
    </div>
  }
}

const AccountsTable = props => {
  return <div className='tbl'>
    <table id='accountTable' data-testid='accountsTable' className='dataTable' aria-label='Accounts'>
      <Header />
      <tbody ref={props.myRef}>
        {props.items.length > 0 && <Rows {...props} />}
      </tbody>
    </table>
  </div>
}

const Header = () => <thead>
  <tr className='sticky-top'>
    <th style={{ width: '200px' }}>Short name</th>
    <th>Full name</th>
    <th style={{ width: '150px' }}>Type</th>
    <th style={{ width: '150px' }} className='text-right'>Opening balance</th>
    <th className='text-center otherCol'>Default</th>
    <th className='text-center otherCol'>Closed</th>
    <th className='text-center otherCol'>Visible</th>
  </tr>
</thead>

const Rows = ({ items, selectedId, onClick }) => items.map(
  x => <Row key={x.id} item={x} selectedId={selectedId} onClick={onClick} />)

const getIcon = value => Boolean(value) ? <i className='fas fa-check-circle' /> : ''

const arePropsEqual = (oldProps, newProps) => (newProps.selectedId !== oldProps.item.id &&
  oldProps.selectedId !== newProps.item.id)

const Row = memo(function Row ({ item, selectedId, onClick }) {
  const selectedClass = selectedId && item.id === selectedId ? 'selectedTableRow' : ''

  // model.setSelected
  return <tr id={item.id} onClick={onClick} className={selectedClass}>
    <td>{item.shortName}</td>
    <td>{item.fullName}</td>
    <td>{item.type}</td>
    <AmountTd amount={item.openingBalance} />
    <td className='text-center'>{getIcon(item.isDefault)}</td>
    <td className='text-center'>{getIcon(item.closed)}</td>
    <td className='text-center'>{getIcon(item.visible)}</td>
  </tr>
}, arePropsEqual)
