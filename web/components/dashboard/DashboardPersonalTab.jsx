'use strict'

import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { rootStore } from '../../stores/rootStore.js'
import classNames from 'classnames'
import { c } from '../../../shared/core/index.js'
import { observer } from 'mobx-react'
import { setTransactionListFilter, formatter, dateFormat } from './dashboardUtils.js'

/**
 * Retirns current balance for an account.
 * @param {number} openingBalance
 * @param {number} total
 * @returns {number}
 */
const calcAccountBalance = (openingBalance, total) => openingBalance + total

/**
 *
 * @param {DashboardModel} model
 * @return {JSX.Element}
 * @constructor
 */
let DashboardPersonalTab = ({ model }) => {
  return <div className='row'>
    <div className='col-sm-12 col-md-6 col-lg-6'>
      <AccountsTable accounts={model.data.accounts} />
      <TasksTable tasks={model.data.tasks} />
      <LatestTransactionsTable transactions={model.data.transactions} title='Latest Transactions' />
    </div>
    <div className='col-sm-12 col-md-6 col-lg-6'>
      <CategoriesTable categories={model.data.budget} title='month' />
      <CategoriesTable categories={model.data.budgetYear} title='YTD' />
      <LatestTransactionsTable
        transactions={model.data.reportExcludedTransactions}
        title='Excluded Transactions'
        options={{
          showReconciled: false,
          showNote: true
        }} />
    </div>
  </div>
}
DashboardPersonalTab = observer(DashboardPersonalTab)
/**
 *
 * @param accounts
 * @return {JSX.Element}
 * @constructor
 */
const AccountsTable = observer(({ accounts }) => {
  let total = { accountId: 'totalAccounts', shortName: 'Total', openingBalance: 0, total: 0 }
  accounts.forEach(x => {
    total.total += calcAccountBalance(x.openingBalance, x.total)
  })

  return <div className='dashboardWidgetContainer'>
    <h5>Accounts</h5>
    <div>
      <table className='dataTable'>
        <thead>
          <tr className='dashboardTh'>
            <th>Account</th>
            <th className='text-right'>Balance</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(x => <AccountTableRow key={x.accountId} account={x} />)}
          <AccountTableRow key={total.accountId} account={total} />
        </tbody>
      </table>
    </div>
  </div>
})

/**
 *
 * @param account
 * @return {JSX.Element}
 * @constructor
 */
const AccountTableRow = observer(({ account }) => {
  const navigate = useNavigate()
  let [searchParams] = useSearchParams()

  /**
   * @param {SyntheticEvent} e
   */
  const handleClick = e => {
    const accountId = e.target.parentNode.id
    if (accountId === 'totalAccounts') return
    setTransactionListFilter(searchParams)
    navigate('/app/transactions')
  }

  const balance = (account.openingBalance + account.total) / 100

  return <tr id={account.accountId} onClick={handleClick}
             className={classNames({ totalBorder: account.shortName === 'Total' })}>
    <td>{account.shortName}</td>
    <td className={classNames('text-right', { 'text-danger': balance < 0 })}>
      {formatter.format(balance)}
    </td>
  </tr>
})

/**
 *
 * @param tasks
 * @return {JSX.Element}
 * @constructor
 */
const TasksTable = observer(({ tasks }) =>
  <div className='dashboardWidgetContainer'>
    <h5>Tasks</h5>
    <div>
      <table className='dataTable'>
        <thead>
          <tr className='dashboardTh'>
            <th>Task</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(x => <TaskTableRow key={x.id} task={x} />)}
        </tbody>
      </table>
    </div>
  </div>)

/**
 *
 * @param task
 * @return {JSX.Element}
 * @constructor
 */
const TaskTableRow = observer(({ task }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    rootStore.transactionsStore.filter.reset()
    rootStore.transactionsStore.filter.accountId = task.accountId
    navigate('/app/transactions')
  }
  return <tr id={task.id} onClick={handleClick}>
    <td>{new Date(task.postedDate).toLocaleDateString('en-us',
      dateFormat)} - {task.shortName} - {task.description} - {task.note}</td>
  </tr>
})

const transactionListDefaultOptions = {
  showReconciled: true,
  showNote: false
}
/**
 *
 * @param transactions
 * @return {JSX.Element}
 * @constructor
 */
const LatestTransactionsTable = observer(
  ({ transactions, options = transactionListDefaultOptions, title }) => <div className='dashboardWidgetContainer'>
    <h5>{title}</h5>
    <div>
      <table className='dataTable'>
        <thead>
          <tr className='dashboardTh'>
            <th>Date</th>
            <th>Account</th>
            <th>Category</th>
            <th>Description</th>
            <th className='text-right'>Amount</th>
            {options.showReconciled && <th className='text-center'>Rec</th>}
            {options.showNote && <th>Note</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map(x => <TransactionTableRow key={Math.random()} transaction={x} options={options} />)}
          {options.showNote && <TransactionsTotal transactions={transactions} />}
        </tbody>

      </table>

    </div>
  </div>
)
/**
 *
 * @param transaction
 * @return {JSX.Element}
 * @constructor
 */
const TransactionTableRow = observer(({ transaction, options }) => <tr>
  <td width='85px' style={{ width: '80px' }}>{new Date(transaction.postedDate).toLocaleDateString('en-gb',
    dateFormat)}</td>
  <td style={{ width: '150px' }}>{transaction.shortName}</td>
  <td style={{ width: '100px' }}>{transaction.name}</td>
  <td className='tdDescription'>{transaction.description}</td>
  <td style={{ width: '50px' }}
      className={classNames('text-right', { 'text-danger': transaction.amount < 0 })}>{formatter.format(
    transaction.amount / 100)}</td>
  {options.showReconciled &&
    <td className='text-right' style={{ width: '20px' }}>
      <input type='checkbox' checked={Boolean(transaction.reconciled)} readOnly />
    </td>}
  {options.showNote && <td className='tdDescription'>{transaction.note.replace('#rep-exclude', '')}</td>}

</tr>)

const TransactionsTotal = ({ transactions }) => {
  const total = transactions.reduce((acc, x) => acc + x.amount, 0)
  return <tr className='totalBorder'>
    <td>TOTAL:</td>
    <td></td>
    <td></td>
    <td></td>
    <td style={{ width: '50px' }} className='text-right'>{formatter.format(total / 100)}</td>
    <td></td>
  </tr>
}

/**
 * @param categories
 * @param title
 * @return {JSX.Element}
 * @constructor
 */
const CategoriesTable = observer(({ categories, title }) => {
  let yearTotals = { categoryId: 'total', name: 'Total', amount: 0, budget: 0, delta: 0 }
  categories.forEach(x => {
    yearTotals.amount += x.amount
    yearTotals.budget += x.budget
    yearTotals.delta += x.delta
  })

  return <div className='dashboardWidgetContainer'>
    <h5>Categories ({title})</h5>
    <div>
      <table className='dataTable' style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr className='dashboardTh'>
            <th>Category</th>
            <th className='text-right'>Budget</th>
            <th className='text-right'>Amount</th>
            <th className='text-right'>Delta</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(x => <CategoriesTableRow key={x.categoryId} category={x} />)}
          <CategoriesTableRow key={yearTotals.categoryId} category={yearTotals} />
        </tbody>
      </table>
    </div>
  </div>
})

/**
 *
 * @param account
 * @return {JSX.Element}
 * @constructor
 */
const CategoriesTableRow = observer(({ category }) => {
  const navigate = useNavigate()
  let [searchParams] = useSearchParams()

  const handleClick = e => {
    const categoryId = e.target.parentNode.id
    if (categoryId === 'total') return
    setTransactionListFilter(searchParams)
    rootStore.transactionsStore.filter.categoryId = categoryId
    rootStore.transactionsStore.filter.accountId = c.selectId.ALL
    navigate('/app/transactions')
  }

  return <tr id={category.categoryId} className={classNames({ totalBorder: category.name === 'Total' })}
             onClick={handleClick}>
    <td>{category.name}</td>
    <td className={classNames('text-right', { 'text-danger': category.budget < 0 })}>{formatter.format(
      category.budget / 100)}</td>
    <td className={classNames('text-right', { 'text-danger': category.amount < 0 })}>{formatter.format(
      category.amount / 100)}</td>
    <td className={classNames('text-right', { 'text-danger': category.delta < 0 })}>{formatter.format(
      Math.round(category.delta / 100))}</td>
  </tr>
})

export default DashboardPersonalTab
