'use strict'

/// <reference path="./FilterModal.jsx" />
import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { AccountSelector, PeriodSelector, SearchEntry, CategorySelector } from '../core'
import { rootStore } from '../../stores/rootStore.js'
import { c } from '../../../shared/core/index.js'
import { IconButton } from '../core/index.js'
import { ThreeDots } from 'react-loader-spinner'
import { FilterModal } from '../transactionForm/FilterModal.jsx'

/**
 * Transaction list toolbar.
 * @param {TransactionListModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
let TransactionListToolbar = ({ model }) => {
  if (!rootStore.masterDataStore.loaded) return null

  const handleSearchChange = e => rootStore.transactionsStore.filter.search = e.target.value

  const handleSearchKey = async e => {
    if (e.keyCode === 13) await model.loadData()
  }

  const handleAccountChange = async e => {
    model.setAccount(e.target.id)
    await model.loadData()
  }

  const handleAddClick = () => model.add()

  const handleCloneClick = async () => model.clone()

  const handleRefreshClick = async () => model.refresh()

  const handleMerge = async () => model.merge()

  const filterButtonActive = model.hasFilter

  // noinspection RequiredAttributes
  return <>
    <FilterModal model={model}/>
    <div id='toolbar' className='pageToolbar'>
      <div>
        <div className='row row-cols-md-auto g-3 align-items-center'>
          <AccountSelector
            accounts={[...rootStore.masterDataStore.accountOptions]}
            selectedAccountId={model.account ? model.account.id : c.selectId.ALL}
            handleChange={handleAccountChange} />
          <SearchEntry value={rootStore.transactionsStore.filter.search} handleChange={handleSearchChange}
                       handleKey={handleSearchKey} />

          <IconButton
            label='filter'
            tooltip='Filter transactions'
            modalToggle='modal'
            modalTarget='#filterModal'
            active={filterButtonActive}
            icon='fas fa-filter'
          />
          <IconButton
            label='add'
            tooltip='Add new transaction'
            icon='fas fa-plus-square'
            disabled={model.addDisabled}
            handleClick={handleAddClick} />
          <IconButton
            label='clone'
            tooltip='Clone transaction'
            icon='fas fa-clone'
            disabled={model.cloneDisabled}
            handleClick={handleCloneClick} />
          <IconButton
            label='refresh'
            tooltip='Reload transactions'
            icon='fas fa-sync'
            handleClick={handleRefreshClick} />
          <IconButton
            label='mapManual'
            tooltip='Merge transactions'
            icon='fas fa-object-group'
            disabled={model.mergeDisabled}
            handleClick={handleMerge} />
          {model.loading && <ThreeDots color='#B88766' height={40} width={40} />}
        </div>
      </div>
    </div>
  </>
}


TransactionListToolbar = observer(TransactionListToolbar)

export default TransactionListToolbar


