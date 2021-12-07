'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import classNames from 'classnames'

export const barId = {
  DETAILS: 'details',
  SPLIT: 'split',
  FILES: 'files',
  MORE: 'more'
}

const spacer = 'me-4'

/**
 * Toolbar for transaction form.
 * @param {FormModel} model
 * @return {JSX.Element}
 * @constructor
 */
let TransactionFormToolbar = ({ model }) => {

  const handleClick = e => model.setToolbarId(e.target.id)

  return <nav className='navbar navbar-expand-lg mb-3'>
      <div className='collapse navbar-collapse' id='navbarNav'>
        <BarLink label='Details' id={barId.DETAILS} selectedId={model.toolBarId} handleClick={handleClick} />
        <BarLink label='Split' id={barId.SPLIT} selectedId={model.toolBarId} handleClick={handleClick} />
        <BarLink label='Files' id={barId.FILES} selectedId={model.toolBarId} handleClick={handleClick} />
        <BarLink label='More...' id={barId.MORE} selectedId={model.toolBarId} handleClick={handleClick} />
      </div>
  </nav>
}

let BarLink = ({id, selectedId, label, handleClick}) => <a
  className={classNames(['nav-link-2', spacer, { active1: selectedId === id }])}
  onClick={handleClick} >
  <span id={id}>{label}</span>
</a>
BarLink = observer(BarLink)

TransactionFormToolbar = observer(TransactionFormToolbar)
export default TransactionFormToolbar
