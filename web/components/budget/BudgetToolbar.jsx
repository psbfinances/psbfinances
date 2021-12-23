'use strict'

import React from 'react'
import { IconButton, PeriodSelector } from '../core/index.js'
import { observer } from 'mobx-react'

/**
 * Budget toolbar.
 * @param {BudgetModel} model
 * @return {JSX.Element}
 * @constructor
 */
const BudgetToolbar = observer(({model}) => {

  return <div id='toolbar' className='pageToolbar'>
    <div>
      <div className='row row-cols-md-auto g-3 align-items-center'>
        <PeriodSelector
          selectedYear={model.year.toString()}
          handleChange={model.handleYearChange} />

        <IconButton
          label='add'
          tooltip='Copy budget from previous year'
          icon='fas fa-plus-square'
          disabled={model.hasBudget}
          handleClick={model.handleAddClick}
        />
      </div>
    </div>
  </div>

})

export default BudgetToolbar
