'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import DropdownButton from './DropdownButton.jsx'

/**
 * Accounts drop-down selector.
 * @param {FinancialAccount[]} accounts
 * @param {string} selectedAccountId
 * @param {function} handleChange
 * @return {JSX.Element}
 * @constructor
 */
let AccountSelector = ({ accounts, selectedAccountId, handleChange }) => {
  let previousType = accounts[0].type

  return <div className='dropdown'>
    <DropdownButton
      id='accountSelectButton'
      items={accounts}
      selectedId={selectedAccountId}
      labelName='shortName' />
    <ul className='dropdown-menu' aria-label='accountSelector'>
      {accounts.map(x => {
        let divider = null
        if (x.type !== previousType) {
          previousType = x.type
          divider = <hr/>
        }
        return <li key={x.id}>
          {divider}
          <a
            id={x.id}
            className={classNames('dropdown-item', { 'active': x.id === selectedAccountId })}
            href='#'
            name='accountSelect'
            onClick={handleChange}>{x.shortName}</a>
        </li>
      })}
    </ul>
  </div>
}

AccountSelector = observer(AccountSelector)
export default AccountSelector
