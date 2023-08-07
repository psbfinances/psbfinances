'use strict'

import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import CategoryForm from './CategoryForm.jsx'
import CategoryModel from './CategoryListModel.js'
import ListToolbar from '../ListToolbar'
import CategoryListModel from './CategoryListModel.js'

const model = new CategoryModel()

/**
 * Category list.
 * @return {JSX.Element}
 * @constructor
 */
const CategoryList = observer(({}) => <CategoryListComponent model={model} />)
export default CategoryList

/**
 * Category list.
 */
class CategoryListComponent extends React.Component {
  async componentDidMount () {
    await model.getData()
  }
  render () {
    const { model } = this.props

    return <div className='dataContainer'>
      <ListToolbar model={model.toolbarModel} />

      <div className='tableAndForm'>
        <CategoriesTable model={model} />
        <CategoryForm model={model} />
      </div>
    </div>
  }
}

CategoryListComponent.propTypes = { model: CategoryListModel }

/**
 *
 * @param {CategoryModel} model
 * @return {JSX.Element}
 * @constructor
 */
let CategoriesTable = ({ model }) => {
  return <div className='tbl'>
    <table id='categoriesTable' data-testid='categoriesTable' className='dataTable' aria-label='Categories'>
      <Header model={model} />
      <tbody>
        <Rows model={model} />
      </tbody>
    </table>
  </div>
}
CategoriesTable = observer(CategoriesTable)

/**
 * Table column header.
 * @return {JSX.Element}
 * @constructor
 */
let Header = ({}) => <thead>
  <tr className='sticky-top'>
    <th style={{ width: '200px' }}>Name</th>
    <th style={{ width: '300px' }}>Personal / business</th>
    <th className='otherCol'>Type</th>
  </tr>
</thead>

/**
 * Table rows.
 * @param {CategoryListModel} model
 * @return
 * @constructor
 */
let Rows = ({ model }) => {
  return model.items.length > 0 ? model.items.map(x => <Row key={x.id} item={x} model={model} />) : null
}
Rows = observer(Rows)

const categoryTypes = {
  i: 'Income',
  e: 'Expenses',
  t: 'Transfer'
}

/**
 * Table row.
 * @param {psbf.Category} item
 * @param {CategoryListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let Row = ({ item, model }) => {
  const selectedClass = model.selectedItem && item.id === model.selectedItem.id ? 'selectedTableRow' : ''

  return <tr id={item.id} onClick={model.setSelected} className={selectedClass}>
    <td>{item.name}</td>
    <td>{Boolean(item.isPersonal) ? 'Personal' : 'Business'}</td>
    <td>{categoryTypes[item.type]}</td>
  </tr>
}
Row = observer(Row)
