'use strict'

import React from 'react'
import { StyledDropzone } from '../../core'
import ImportListToolbar from './ImportListToolbar'
import { c } from '../../../../shared/core/index.js'
import { SelectField } from '../../core'
import { rootStore } from '../../../stores/rootStore'
import * as api from '../../../../shared/apiClient/index.js'
import { ThreeDots } from 'react-loader-spinner'
import ImportLog from '@psbfinances/server/dip/importLog.js'
import { setTransactionListFilter } from '../../dashboard/dashboardUtils.js'
import { useNavigate, useSearchParams } from 'react-router-dom'

const dateFormat = { month: 'short', day: 'numeric', year: 'numeric' }

/**
 * @typedef {Object} ImportFormat
 * @property {string} id
 * @property {string} name
 * @property {boolean} accountOptionVisible
 * @property {FinancialAccount[]} [accounts]
 */

/** @type {ImportFormat[]} */
export const importFormats = [
  { id: c.importFormatId.BOA_AGR_CSV, name: 'BoA Aggregator', accountOptionVisible: false },
  { id: c.importFormatId.APPLE_CARD_CSV, name: 'Apple Card', accountOptionVisible: true, accounts: [] },
  // { id: c.importFormatId.CITI_CARD_CVS, name: 'Citi Card', accountOptionVisible: true, accounts: [] },
  { id: c.importFormatId.MINT_CSV, name: 'Mint', accountOptionVisible: false }
]
const formatOptions = importFormats.map(x => ({ value: x.id, label: x.name }))

/**
 * Import list.
 */
export default class ImportList extends React.Component {
  state = {
    running: false,
    items: []
  }

  async componentDidMount () {
    await this.getData()
  }

  getData = async () => {
    const items = await api.importApi.list()
    this.setState({ items })
  }

  handleRefreshClick = async () => this.getData()

  handleUndoClick = async e => {
    const id = e.target.id
    await api.importApi.delete(id)
    await this.getData()
  }

  /**
   * Auto-reload import records after import was submitted.
   * @return {Promise<void>}
   */
  reload = async () => {
    this.setState({ running: true })
    const lastId = this.state.items.length > 0 ? this.state.items[0].id : null
    let counter = 0
    const reloadId = setInterval(async () => {
      await this.getData()
      const newLastId = this.state.items.length > 0 ? this.state.items[0].id : null
      if (newLastId !== lastId || counter++ >= 40) {
        clearInterval(reloadId)
        await rootStore.masterDataStore.getAccounts()
        await rootStore.masterDataStore.getCategories()
        this.setState({ running: false })
      }
    }, 1000)
  }

  render () {
    return <div id='dataContainer' className='dataContainer'>
      <ImportListToolbar handleRefreshClick={this.handleRefreshClick} />
      <div id='transactions' className='tableAndForm'>
        <ImportsTable items={this.state.items} handleUndoClick={this.handleUndoClick} />
        <ImportForm reload={this.reload} running={this.state.running} />
      </div>
    </div>
  }
}

/**
 * Import table.
 * @param {Object[]} items
 * @param {function} handleUndoClick
 * @return {JSX.Element}
 * @constructor
 */
const ImportsTable = ({ items, handleUndoClick }) => {
  return (
    <div className='tbl'>
      <table className='dataTable'>
        <thead>
          <tr>
            <th>Import Date</th>
            <th>Format</th>
            <th>Date from</th>
            <th>Date to</th>
            <th className='text-right'>All transactions</th>
            <th className='text-right'>New transactions</th>
            <th className='text-right'>New accounts</th>
            <th className='text-right'>New categories</th>
            <th className='text-right'>New rules</th>
            <th className='text-right'>Bad Rows</th>
            <th className='text-right' style={{ width: '80px' }} />
          </tr>
        </thead>
        <tbody>
          {items.map(x => <TableRow key={x.id} item={x} handleUndoClick={handleUndoClick} />)}
        </tbody>
      </table>
    </div>
  )
}

const TableRow = ({ item, handleUndoClick }) => {
  const navigate = useNavigate()
  let [searchParams] = useSearchParams()

  const importLog = ImportLog.getFromDbEntry(item)
  const elapsedHours = Math.round((new Date() - new Date(item.stepDateTime)) / (1000 * 3600))
  const undoButtonVisible = elapsedHours <= 2

  const handleImportRowClick = e => {
    const processId = e.target.parentNode.id
    setTransactionListFilter(searchParams)
    rootStore.transactionsStore.filter.importProcessId = processId
    rootStore.transactionsStore.filter.accountId = c.selectId.ALL
    navigate('/app/transactions')
  }

  return <tr id={item.processId} onClick={handleImportRowClick}>
    <td>{(new Date(item.stepDateTime)).toLocaleDateString('en-us', dateFormat)}</td>
    <td>{item.source}</td>
    <td>{(new Date(importLog.stats.newTransactionsDateFrom)).toLocaleDateString('en-us', dateFormat)}</td>
    <td>{new Date(importLog.stats.newTransactionsDateTo).toLocaleDateString('en-us', dateFormat)}</td>
    <td className='text-right'>{importLog.counts.allTransactions}</td>
    <td className='text-right'>{importLog.counts.newTransactions}</td>
    <td className='text-right'>{importLog.counts.newAccounts}</td>
    <td className='text-right'>{importLog.counts.newCategories}</td>
    <td className='text-right'>{importLog.counts.newRules}</td>
    <td className='text-right'>{importLog.newData && importLog.newData.badRows ? importLog.newData.badRows.length : 0}</td>
    <td>
      {undoButtonVisible && <button id={item.id} className='btn btn-link' onClick={handleUndoClick}>Undo</button>}
    </td>
  </tr>
}

/**
 * @typedef {Object} ImportFormState
 * @property {string} formatId
 * @property {string} accountId
 * @property {boolean} accountOptionVisible
 * @property {SelectOption[]} accountOptions
 * @property {?Object} fileInfo
 */

class ImportForm extends React.Component {
  /** @type {ImportFormState} */ state
  /** @type {File} */ file

  constructor (props) {
    super(props)
    this.file = null
    this.state = {
      formatId: formatOptions[0].value,
      accountId: null,
      fileInfo: null,
      accountOptionVisible: false,
      accountOption: []
    }
  }

  handleImport = async (e) => {
    e.preventDefault()
    if (!this.file) return Promise.resolve()

    const formData = new FormData()
    formData.append('importFile', this.file)
    formData.append('formatId', this.state.formatId)
    if (this.state.accountOptionVisible) {
      formData.append('accountId', this.state.accountId || this.state.accountOptions[0].value)
    }
    this.props.reload()
    await api.importApi.post(formData)
  }

  /**
   *
   * @param {File} file
   */
  handleDroppedFile = (file) => {
    this.file = file
  }

  async componentDidMount () {
    await rootStore.masterDataStore.getAccounts()
  }

  handleFormatChange = e => {
    const importFormat = importFormats.find(x => x.id === e.target.value)
    const accountOptions = importFormat.accountOptionVisible
      ? [...rootStore.masterDataStore.accounts.values()].filter(x => x.format === importFormat.id).
        map(x => ({ value: x.id, label: x.shortName }))
      : []
    this.setState(
      { formatId: e.target.value, accountOptionVisible: importFormat.accountOptionVisible, accountOptions })
  }

  handleAccountChange = e => {
    e.preventDefault()
    this.setState({ accountId: e.target.value })
  }

  render () {
    return <div id='dataContainer' className='frm formDataContainer'>
      <div id='formContainer' data-testid='formContainer' className='formContainer'>
        <div className='col-form-label-sm'>
          <label className='mb-2'>Import file</label>
          <StyledDropzone handleDrop={this.handleDroppedFile} />
        </div>

        <SelectField
          id='formatId'
          label='Format'
          options={formatOptions}
          value={this.state.formatId}
          handler={this.handleFormatChange} />
        <SelectField
          id='accountId'
          visible={this.state.accountOptionVisible}
          value={this.state.accountId}
          label='Account'
          options={this.state.accountOptions}
          handler={this.handleAccountChange} />

        <div className='mt-4 mb-3'>
          <div className='form-group mb-3'>
            {!this.props.running && <button onClick={this.handleImport} className='btn btn-primary'> Import</button>}
            {this.props.running && <ThreeDots color='#B88766' height={40} width={40} />}
          </div>
        </div>
      </div>
    </div>
  }
}
