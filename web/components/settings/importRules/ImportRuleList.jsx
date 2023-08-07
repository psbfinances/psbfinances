'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import ImportRuleForm from './ImportRuleForm.jsx'
import ImportRuleListModel from './ImportRuleListModel.js'
import ListToolbar from '../ListToolbar'
import DropdownButton from '../../core/DropdownButton.jsx'
import classNames from 'classnames'
import {c} from '../../../../shared/core/index.js'
import MintRuleForm from './MintRuleForm.jsx'
import AppleCardRuleForm from './AppleCardRuleForm.jsx'

const adapterOptions = Object.keys(c.dipAdapters).map(x => c.dipAdapters[x])

const model = new ImportRuleListModel()

/**
 * Rule list.
 * @return {JSX.Element}
 * @constructor
 */
const RuleList = observer(({}) => <ImportRulesListComponent model={model} />)
export default RuleList

/**
 * Rule list.
 * @param {ImportRuleListModel} model
 */
class ImportRulesListComponent extends React.Component {
  async componentDidMount () {
    await model.getData()
  }

  render () {
    const { model } = this.props

    return <div className='dataContainer'>
      <ListToolbar model={model.toolbarModel}>
        <div className='col dropdown mt-1 me-2'>
          <DropdownButton id='adapterSelect' items={adapterOptions} selectedId={model.selectedAdapter.id}
                          labelName='label' />
          <ul className='dropdown-menu' aria-label='adapterSelect'>
            {adapterOptions.map(x => <li key={x.id}>
              <a
                id={x.id}
                className={classNames('dropdown-item', { 'active': x.id === model.selectedAdapter.id })}
                href='#'
                name='periodSelect'
                onClick={model.handleAdapterChange}>{x.label}</a>
            </li>)}
          </ul>
        </div>

      </ListToolbar>

      <div className='tableAndForm'>
        <ImportRuleListTable model={model} />
        {model.selectedAdapter.id === c.dipAdapters.all.id && <ImportRuleForm model={model} />}
        {model.selectedAdapter.id === c.dipAdapters.mint.id && <MintRuleForm model={model} />}
        {model.selectedAdapter.id === c.dipAdapters.appleCard.id && <AppleCardRuleForm model={model} />}
      </div>
    </div>
  }
}

ImportRulesListComponent.propTypes = { model: ImportRuleListModel }
ImportRulesListComponent = observer(ImportRulesListComponent)

/**
 *
 * @param {ImportRuleListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let ImportRuleListTable = ({ model }) => {
  return <div className='tbl'>
    <table id='importRuleTable' data-testid='importRuleTable' className='dataTable' aria-label='Import Rules'>
      <Header model={model} />
      <tbody>
        <Rows model={model} />
      </tbody>
    </table>
  </div>
}
ImportRuleListTable = observer(ImportRuleListTable)

/**
 * Table column header.
 * @return {JSX.Element}
 * @constructor
 */
let Header = ({}) => <thead>
  <tr className='sticky-top'>
    <th>Rule</th>
    <th className='otherCol2 text-center'>Disabled</th>
  </tr>
</thead>

/**
 * Table rows.
 * @param {ImportRuleListModel} model
 * @return
 * @constructor
 */
let Rows = ({ model }) => {
  return model.items.length > 0 ? model.items.map(x => <Row key={x.id} item={x} model={model} />) : null
}
Rows = observer(Rows)

/**
 * Table row.
 * @param {DipRuleItem} item
 * @param {ImportRuleListModel} model
 * @return {JSX.Element}
 * @constructor
 */
let Row = ({ item, model }) => {
  const selectedClass = model.selectedItem && item.id === model.selectedItem.id ? 'selectedTableRow' : ''

  return <tr id={item.id} onClick={model.setSelected} className={selectedClass}>
    <td>If matches: <strong>{item.uiTextParts.condition} </strong><br/> Do this: {item.uiTextParts.action}</td>
    <td className='text-center'><input type='checkbox' readOnly checked={item.disabled}/></td>
  </tr>
}
Row = observer(Row)
