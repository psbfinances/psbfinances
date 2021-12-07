'use strict'

import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import BusinessListModel from './BusinessListModel'
import ListToolbar from '../ListToolbar'
import BusinessForm from './BusinessForm.jsx'

/**
 * Business list.
 * @return {JSX.Element}
 * @constructor
 */
let BusinessList = ({}) => {
  let model = new BusinessListModel()
  return <BusinessListComponent model={model} />
}
BusinessList = observer(BusinessList)
export default BusinessList

/**
 * Business list.
 */
let BusinessListComponent = ({ model }) => {
  useEffect(async () => {await model.getData()}, [])

  return <div className='dataContainer'>
    <ListToolbar model={model.toolbarModel} />

    <div className='tableAndForm'>
      <BusinessesTable model={model} />
      <BusinessForm model={model} />
    </div>
  </div>
}

/**
 *
 * @param {BusinessListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let BusinessesTable = ({ model }) => {
  return <div className='tbl'>
    <table id='businessesTable' data-testid='businessesTable' className='dataTable' aria-label='Businesses'>
      <Header model={model} />
      <tbody>
        <Rows model={model} />
      </tbody>
    </table>
  </div>
}
BusinessesTable = observer(BusinessesTable)

/**
 * Table column header.
 * @return {JSX.Element}
 * @constructor
 */
let Header = ({}) => <thead>
  <tr className='sticky-top'>
    <th style={{ width: '200px' }}>Nickname</th>
    <th style={{ width: '300px' }}>Full name</th>
  </tr>
</thead>

/**
 * Table rows.
 * @param {BusinessListModel} model
 * @return
 * @constructor
 */
let Rows = ({ model }) => {
  return model.items.length > 0 ? model.items.map(x => <Row key={x.id} item={x} model={model} />) : null
}
Rows = observer(Rows)

/**
 * Table row.
 * @param {Business} item
 * @param {BusinessListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let Row = ({ item, model }) => {
  const selectedClass = model.selectedItem && item.id === model.selectedItem.id ? 'selectedTableRow' : ''

  return <tr id={item.id} onClick={model.setSelected} className={selectedClass}>
    <td>{item.nickname}</td>
    <td>{item.fullName}</td>
  </tr>
}
Row = observer(Row)
