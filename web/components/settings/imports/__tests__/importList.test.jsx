'use strict'

import * as React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'
import ImportList, { importFormats } from '../ImportList'
import { setupRootStore } from '../../../__tests__/helper'
import * as api from '../../../../../shared/apiClient/index.js'
import { accounts } from '../../../__tests__/data.js'

beforeAll(async () => {
  await setupRootStore()
})

/** render form */
describe('render form', () => {
  beforeEach(() => {
    api.accountApi.list = jest.fn().mockResolvedValueOnce(accounts)
    api.importApi.list = jest.fn().mockResolvedValueOnce([
      {
        id: 'ckszzd70l000zk3yh17lv7adv',
        processId: 'ckszzd5ol0001k3yh0dj4ceun',
        step: 'end',
        source: 'mint',
        fileName: 'tenant-01-ckszzd5o50000k3yh5wsz4f33-mint-enr.csv',
        counts: '{"allTransactions":996,"newTransactions":31,"missingAccount":0,"missingCategory":2,"duplicateCandidates":2}',
        stats: '{"dateFrom":"2021-08-21T05:00:00.000Z","dateTo":"2021-08-31T05:00:00.000Z","newTransactionsDateFrom":"2021-08-21T05:00:00.000Z","newTransactionsDateTo":"2021-08-31T05:00:00.000Z"}',
        stepDateTime: '2021-08-31T11:21:46.000Z',
        fileInfo: null
      }])
  })

  it('renders format without account option', () => {
    render(<ImportList />)

    expect(screen.getByLabelText('Format')).toHaveDisplayValue(importFormats[0].name)
    expect(screen.queryByLabelText('Account')).not.toBeInTheDocument()
  })

  it('renders format with account option', async () => {
    render(<ImportList />)

    const formatWithAccounts = importFormats.find(x => x.accountOptionVisible)
    const formatSelect = screen.getByLabelText('Format')
    await userEvent.selectOptions(formatSelect, formatWithAccounts.id)
    expect(screen.getByLabelText('Format')).toHaveDisplayValue(formatWithAccounts.name)
    expect(screen.getByLabelText('Account')).toBeInTheDocument()
  })
})

