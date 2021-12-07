'use strict'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate, useLocation } from 'react-router-dom'
import Toolbar from '../core/PageToolbar.jsx'
import { tenantApi } from '../../../shared/apiClient/index.js'
import { utils } from '../../../shared/core/index.js'

const PAGE_ROOT_URL = '/app/tenants'

const config = {
  search: {
    visible: true,
    handleSubmit: () => {}
  },
  pagination: {
    visible: true
  },
  buttons: [
    { label: 'New', handleClick: () => {} }
  ]
}

/*
Navigation tests:
  - list - render all
  - list | all -> click on row
    - back
    - breadcrumb back
  - list | filter -> click on row
    - back
    - breadcrumb back
  - direct url change
  - search box change
  - search box clear
 */

/**
 * Tenants list.
 * @return {JSX.Element}
 */
const TenantList = () => {
  const [hasData, setHasData] = useState(false)
  /** @type {Array<Tenant, Function>} */
  const [items, setItems] = useState([])
  const [previousLocation, setPreviousLocation] = useState('')
  const history = useNavigate()
  const location = useLocation()
  const searchValue = utils.getSearchFromLocation(location)
  console.log({ code: 'Constructor', searchValue, hasData, items })

  /**
   * Table row click handler - navigate to form view.
   * @param {SyntheticEvent} e
   */
  const handleRowClick = e => {
    e.preventDefault()
    history.push(`${PAGE_ROOT_URL}/${e.target.parentElement.id}`)
  }

  /**
   * Search submit handler.
   * @param {string} searchValue
   */
  config.search.handleSubmit = searchValue => {
    setHasData(false)
    const path = searchValue === '' ? PAGE_ROOT_URL : `${PAGE_ROOT_URL}?search=${searchValue}`
    history.push(path)
  }

  /**
   * Gets remote data.
   * @property {string} searchValue
   * @return {Promise<void>}
   */
  const getData = async searchValue => {
    console.log({ code: 'getData', searchValue, hasData })
    const items = await tenantApi.list(searchValue)
    setItems(items)
    setHasData(true)
  }

  const handleEffect = () => {
    const runHandler = async () => {
      console.log({ code: 'handleEffect', searchValue, hasData })
      if (previousLocation !== location.search) {
        setPreviousLocation(location.search)
        setHasData(false)
      }
      if (!hasData) await getData(searchValue)
    }

    runHandler().then(() => {})
  }

  useEffect(handleEffect, [hasData, location])

  if (!hasData) return <div data-testid='loadingDiv'>Loading...</div>

  return (
    <>
      <div id='pageHeader'>
        <Toolbar config={config} />
      </div>

      <DataContainer>
        <FormContainer>
          <TenantTable items={items} onRowClick={handleRowClick} />
        </FormContainer>
      </DataContainer>
    </>
  )
}

/**
 * Table element.
 * @param items
 * @param {Function} onRowClick
 * @return {JSX.Element}
 * @constructor
 */
const TenantTable = ({ items = [], onRowClick }) =>
  <Table data-testid='tenantTable'>
    <thead>
      <TableHeader>
        <IdColumn>Short Name</IdColumn>
        <IdColumn>Name</IdColumn>
      </TableHeader>
    </thead>
    <tbody>
      {items.map(x => <TenantRow key={x.id} item={x} onRowClick={onRowClick} />)}
    </tbody>
  </Table>

/**
 * Row element.
 * @param item
 * @param {Function} onRowClick
 * @return {JSX.Element}
 * @constructor
 */
const TenantRow = ({ item, onRowClick }) =>
  <ItemTableRow onClick={onRowClick} id={item.id}>
    <Td>{item.shortName}</Td>
    <Td>{item.fullName}</Td>
  </ItemTableRow>

/**
 * Styles.
 *
 */
const DataContainer = styled.div`
  background-color: white;
  margin-top: 10px;
`
const FormContainer = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 4px;
  padding: 10px;
`
const TableHeader = styled.tr`
  background-color: #eee;
  font-weight: 700;
`
const ItemTableRow = styled.tr`
  background-color: white;
  cursor: pointer;
`
const Td = styled.td`
  border: 1px solid #ddd;
  padding: 8px 18px 8px 9px;
  font-weight: normal;
`
const IdColumn = styled.th`
  border: 1px solid #ddd;
  padding: 8px 18px 8px 9px;
  font-weight: bold;
`
const Table = styled.table`
  width: 100%;
  border: 1px solid #ccc;
  margin-top: 5px;
  font-size: 12px;

${ItemTableRow}:nth-child(even) ${Td} {
  background-color: rgba(242, 245, 245, 0.8);
}
`

export default TenantList

export { TenantList }
