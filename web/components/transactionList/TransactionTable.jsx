'use strict'

import React, { useRef } from 'react'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import { c } from '../../../shared/core/index.js'
import { rootStore } from '../../stores/rootStore.js'
import { AmountTd } from '../core'

const dateFormat = { month: 'short', day: 'numeric' }

const formatDate = date => new Date(date).toLocaleDateString('en-gb', dateFormat)

/**
 * Transactions table.
 * @param {ListModel} model
 * @return {JSX.Element}
 * @constructor
 */
function TransactionTable ({ model }) {
  const ref = useRef(null)
  if (!model.account) return null

  if (ref && ref.current && ref.current.scrollTo) ref.current.scrollTo(0, 0)

  return <div className='tbl' ref={ref}>
    <table id='transactionTable' data-testid='transactionTable' className='dataTable' aria-label='Transactions'>
      <Header model={model} />
      <tbody>
        <Rows model={model} />
      </tbody>
    </table>
  </div>
}

/**
 * Table header
 * @param {ListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let Header = ({ model }) => {
  const categoryHeader = rootStore.masterDataStore.hasBusinesses ? 'Category / Business' : 'Category'
  return <thead>
    <tr className='sticky-top'>
      <th className='dateCol text-right'>Date</th>
      {model.accountColumnVisible && <th className='accountCol'>Account</th>}
      <th className='descriptionCol'>Description</th>
      <th className='categoryCol'>{categoryHeader}</th>
      <th className='amountCol'>Amount</th>
      {model.balanceColumnVisible && <th className='amountCol'>Balance</th>}
      {model.scheduledColumnVisible && <th className='otherCol text-center'>Sch.</th>}
      <th className='otherCol text-center'>Rec.</th>
      <th className='otherCol'>Meta</th>
    </tr>
  </thead>
}
Header = observer(Header)

/**
 * Table rows
 * @param {ListModel} model
 * @return {JSX.Element[]}
 * @constructor
 */
let Rows = ({ model }) => {
  return model.items.map(x => <Row key={x.id} item={x} model={model} />)
}
Rows = observer(Rows)

/**
 * Row element.
 * @param {psbf.TransactionUI} item
 * @param {ListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let Row = ({ item, model }) => {
  if (item.meta) {
    // w/o this call Row is not updated when hasAttachment is set in Attachment.jsx
    // noinspection JSUnusedLocalSymbols
    const unUsed = item.meta.hasAttachment
  }

  /**
   * Handles selection of another transaction.
   * @param e
   * @return {Promise<void>}
   */
  const handleRowClick = async e => {
    e.preventDefault()
    const transactionId = e.currentTarget.id
    if (e.metaKey && transactionId !== rootStore.transactionsStore.selectedItem.id) {
      console.log(rootStore.transactionsStore.selectedItem.id, e.currentTarget.id)
      model.secondSelectedId = e.currentTarget.id
      return
    }
    model.secondSelectedId = null
    model.setFormDetailedView()
    await rootStore.transactionsStore.setSelectedItemById(transactionId)

    if (e.target.type !== 'checkbox') return Promise.resolve()

    if (e.target.name === 'reconciled') await rootStore.transactionsStore.toggleReconciled()
    if (e.target.name === 'scheduled') {
      if (rootStore.transactionsStore.selectedItem.source === c.sources.IMPORT) {
        e.preventDefault()
        return Promise.resolve()
      }
      await rootStore.transactionsStore.toggleScheduled()
    }
  }

  const handleScheduledClick = e => {
    item.scheduled = e.target.checked
  }

  const handleReconciledClick = e => {
    item.reconciled = e.target.checked
  }

  const selectedTableRow = (rootStore.transactionsStore.selectedItem && rootStore.transactionsStore.selectedItem.id ===
    item.id) || (model.secondSelectedId && model.secondSelectedId === item.id)
  const newMonth = Boolean(item.isNewMonth)
  const manual = item.source === c.sources.MANUAL
  const trClasses = classNames(['trRow', { selectedTableRow: selectedTableRow }, { newMonth: newMonth }])
  const amountClass = `amountCol ${item.amount < 0 ? 'text-danger' : 'text-success'}`
  const balanceClass = `amountCol ${item.balance < 0 ? 'text-danger' : 'text-success'}`
  const isChildRow = Boolean(item.parentId)
  const descriptionClasses = classNames(['truncate', 'descriptionCol', { manual: manual }])

  return <tr id={item.id} onClick={handleRowClick} className={trClasses}>

    <td className='text-right dateCol'>{isChildRow ? '' : formatDate(item.postedDate)}</td>

    {model.accountColumnVisible && <td className='truncate accountCol'>{isChildRow ? '' : item.accountName}</td>}

    <td className={descriptionClasses}>
      {Boolean(item.hasChildren) && <i className='fas fa-caret-right me-1' />}
      {isChildRow ? '' : item.description}
    </td>

    <td className='truncate categoryCol'>
      {item.hasChildren ? '' : item.categoryDescription}
      {item.businessId !== c.PERSONAL_TYPE_ID && <div className='businessCol'>{item.businessDescription}</div>}
    </td>

    {/*<td className={amountClass}>{formatCurrency(item.amount)}</td>*/}
    <AmountTd amount={item.amount} tdClass={amountClass} />

    {model.balanceColumnVisible && <AmountTd amount={item.balance} showValue={!isChildRow} tdClass={balanceClass} />}

    {/*{model.balanceColumnVisible && <td className={balanceClass}>{!isChildRow ? formatCurrency(item.balance) : ''}</td>}*/}

    {model.scheduledColumnVisible && <td className='text-center otherCol'>
      <input
        readOnly={item.source === c.sources.IMPORT}
        name='scheduled'
        type='checkbox'
        checked={Boolean(item.scheduled)}
        onChange={handleScheduledClick}
      />
    </td>}
    <td className='text-center otherCol'>
      <input
        name='reconciled'
        type='checkbox'
        checked={Boolean(item.reconciled)}
        onChange={handleReconciledClick}
      />
    </td>
    <td className='otherCol'>
      <Icons item={item} />
    </td>
  </tr>
}
Row = observer(Row)

let Icons = ({ item }) =>
  <>
    {item.note && <i className='far fa-sticky-note me-1' />}
    {item.duplicateCandidateId && <i className='far fa-clone me-1' />}
    {item.source === 'm' && <i className='fas fa-pen-fancy me-1' />}
    {item.tripId && <i className='fas fa-car me-1' />}
    {item.note && item.note.toLowerCase().includes('task') && <i className='fas fa-tasks me-1' />}
    {item.meta && item.meta.hasAttachment && <i className='fas fa-paperclip' />}
  </>
Icons = observer(Icons)

TransactionTable = observer(TransactionTable)
export default TransactionTable
