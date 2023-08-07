'use strict'

import { observer } from 'mobx-react'
import CarListModel from './CarListModel'
import ListToolbar from '../ListToolbar'
import CarForm from './CarForm.jsx'
import React from 'react'

const model = new CarListModel()

/**
 * Car list.
 * @return {JSX.Element}
 * @constructor
 */
const CarList = observer(({}) => <CarListComponent model={model} />)
export default CarList

/**
 * Car list.
 */
class CarListComponent extends React.Component {
  async componentDidMount () {
    await model.getData()
  }

  render () {
    const { model } = this.props

    return <div className='dataContainer'>
      <ListToolbar model={model.toolbarModel} />

      <div className='tableAndForm'>
        <CarTable model={model} />
        <CarForm model={model} />
      </div>
    </div>
  }
}

CarListComponent.propTypes = { model: CarListModel }

/**
 *
 * @param {CarListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let CarTable = ({ model }) => {
  return <div className='tbl'>
    <table id='carsTable' data-testid='carsTable' className='dataTable' aria-label='Cars'>
      <Header model={model} />
      <tbody>
        <Rows model={model} />
      </tbody>
    </table>
  </div>
}
CarTable = observer(CarTable)

/**
 * Table column header.
 * @return {JSX.Element}
 * @constructor
 */
let Header = ({}) => <thead>
  <tr className='sticky-top'>
    <th>Description</th>
    <th style={{ width: '80px' }}>In use</th>
  </tr>
</thead>

/**
 * Table rows.
 * @param {CarListModel} model
 * @return
 * @constructor
 */
let Rows = ({ model }) => {
  return model.items.length > 0 ? model.items.map(x => <Row key={x.id} item={x} model={model} />) : null
}
Rows = observer(Rows)

/**
 * Table row.
 * @param {Car} item
 * @param {CarListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let Row = ({ item, model }) => {
  const getIcon = value => Boolean(value) ? <i className='fas fa-check-circle' /> : ''
  const selectedClass = model.selectedItem && item.id === model.selectedItem.id ? 'selectedTableRow' : ''

  return <tr id={item.id} onClick={model.setSelected} className={selectedClass}>
    <td>{item.description}</td>
    <td className='text-center'>{getIcon(item.isInUse)}</td>
  </tr>
}
Row = observer(Row)
