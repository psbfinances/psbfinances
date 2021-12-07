'use strict'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { rootStore } from '../../stores/rootStore.js'
import classNames from 'classnames'
import {c} from '../../../shared/core/index.js'

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const dateFormat = { month: 'short', day: 'numeric' }

const DashboardPersonalTab = (props) => {
  return <div className='row'>
    <div className='col-sm-12 col-md-6 col-lg-6'>
      <AccountsTable accounts={props.accounts} />
      <TasksTable tasks={props.tasks} />
      <LatestTransactionsTable transactions={props.transactions} />
    </div>
    <div className='col-sm-12 col-md-6 col-lg-6'>
      <CategoriesTable categories={props.categories} title='month'/>
      <CategoriesTable categories={props.categoriesYear} title='year'/>
    </div>
  </div>
}

/**
 *
 * @param accounts
 * @return {JSX.Element}
 * @constructor
 */
const AccountsTable = ({ accounts }) => {
  let total = { accountId: 'totalAccounts', shortName: 'Total', openingBalance: 0, total: 0 }
  accounts.forEach(x => {
    total.total += x.total
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
}

/**
 *
 * @param account
 * @return {JSX.Element}
 * @constructor
 */
const AccountTableRow = ({ account }) => {
  const navigate = useNavigate()
  /**
   * @param {SyntheticEvent} e
   */
  const handleClick = e => {
    const accountId = e.target.parentNode.id
    if (accountId === 'totalAccounts') return
    rootStore.transactionsStore.filter.reset()
    rootStore.transactionsStore.filter.accountId = accountId
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
}

/**
 *
 * @param tasks
 * @return {JSX.Element}
 * @constructor
 */
const TasksTable = ({ tasks }) =>
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
  </div>

/**
 *
 * @param task
 * @return {JSX.Element}
 * @constructor
 */
const TaskTableRow = ({ task }) => {
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
}

/**
 *
 * @param transactions
 * @return {JSX.Element}
 * @constructor
 */
const LatestTransactionsTable = ({ transactions }) => <div className='dashboardWidgetContainer'>

  <h5>Latest transactions</h5>
  <div>
    <table className='dataTable'>
      <thead>
        <tr className='dashboardTh'>
          <th>Date</th>
          <th>Account</th>
          <th>Category</th>
          <th>Description</th>
          <th className='text-right'>Amount</th>
          <th className='text-center'>Rec</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(x => <TransactionTableRow key={Math.random()} transaction={x} />)}
      </tbody>

    </table>

  </div>
</div>

/**
 *
 * @param transaction
 * @return {JSX.Element}
 * @constructor
 */
const TransactionTableRow = ({ transaction }) => <tr>
  <td width='85px' style={{ width: '80px' }}>{new Date(transaction.postedDate).toLocaleDateString('en-gb',
    dateFormat)}</td>
  <td style={{ width: '150px' }}>{transaction.shortName}</td>
  <td style={{ width: '100px' }}>{transaction.name}</td>
  <td className='tdDescription'>{transaction.description}</td>
  <td style={{ width: '50px' }}
      className={classNames('text-right', { 'text-danger': transaction.amount < 0 })}>{formatter.format(
    transaction.amount / 100)}</td>
  <td className='text-right' style={{ width: '20px' }}><input type='checkbox' checked={Boolean(transaction.reconciled)}
                                                              readOnly /></td>
</tr>

/**
 * @param categories
 * @param title
 * @return {JSX.Element}
 * @constructor
 */
const CategoriesTable = ({ categories, title }) => {
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
            <th className='text-right'>Amount</th>
            <th className='text-right'>Budget</th>
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
}

/**
 *
 * @param account
 * @return {JSX.Element}
 * @constructor
 */
const CategoriesTableRow = ({ category }) => {
  const navigate = useNavigate()

  const handleClick = e => {
    const categoryId = e.target.parentNode.id
    if (categoryId === 'total') return
    rootStore.transactionsStore.filter.reset()
    rootStore.transactionsStore.filter.categoryId = categoryId
    rootStore.transactionsStore.filter.accountId = c.selectId.ALL
    navigate('/app/transactions')
  }

  return <tr id={category.categoryId} className={classNames({ totalBorder: category.name === 'Total' })}
             onClick={handleClick}>
    <td>{category.name}</td>
    <td className={classNames('text-right', { 'text-danger': category.amount < 0 })}>{formatter.format(
      category.amount / 100)}</td>
    <td className={classNames('text-right', { 'text-danger': category.budget < 0 })}>{formatter.format(
      category.budget / 100)}</td>
    <td className={classNames('text-right', { 'text-danger': category.delta < 0 })}>{formatter.format(
      Math.round(category.delta / 100))}</td>
  </tr>
}

export default DashboardPersonalTab
