'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import DropdownButton from './DropdownButton.jsx'

/**
 * Accounts drop-down selector.
 * @param {Account[]} accounts
 * @param {string} selectedAccountId
 * @param {function} handleChange
 * @return {JSX.Element}
 * @constructor
 */
let AccountSelector = ({ accounts, selectedAccountId, handleChange }) => {
  return <div className='dropdown'>
    <DropdownButton
      id='accountSelectButton'
      items={accounts}
      selectedId={selectedAccountId}
      labelName='shortName' />
    <ul className='dropdown-menu' aria-label='accountSelector'>
      {accounts.map(x => <li key={x.id}>
        <a
          id={x.id}
          className={classNames('dropdown-item', { 'active': x.id === selectedAccountId })}
          href='#'
          name='accountSelect'
          onClick={handleChange}>{x.shortName}</a>
      </li>)}
    </ul>
  </div>
}

AccountSelector = observer(AccountSelector)
export default AccountSelector
