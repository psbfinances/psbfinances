'use strict'

import React from 'react'
import { IconButton } from '../core/index.js'

export default class BudgetToolbar extends React.Component {

  render () {
    return <div id='toolbar' className='pageToolbar'>
      <div>
        <div className='row row-cols-md-auto g-3 align-items-center'>
          <IconButton
            label='add'
            tooltip='Add new budget'
            icon='fas fa-plus-square'
            // disabled={model.addDisabled}
            // handleClick={handleAddClick}
          />
        </div>
      </div>
    </div>
  }
}
