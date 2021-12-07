'use strict'

import React from 'react'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import { barId } from './TransactionFormToolbar.jsx'
import * as api from '../../../shared/apiClient/index.js'
import { rootStore } from '../../stores/rootStore.js'
import { utils } from '../../../shared/core/index.js'

export class MoreModel {
  items = []

  constructor () {
    makeAutoObservable(this)
  }

  * getData () {
    this.items = rootStore.transactionsStore.editItem
      ? (yield api.duplicateTransactionApi.listByParentTransactionId(rootStore.transactionsStore.editItem.id)).data
      : []
  }

  get hasData () {
    return this.items.length > 0
  }
}

const More = observer(
  class More extends React.Component {
    /** @type {MoreModel} */ model

    /**
     * @param {Object} props
     * @param {FormModel} props.formModel
     */
    constructor (props) {
      super(props)
      this.model = new MoreModel()
    }

    async componentDidMount () {
      if (this.props.formModel.toolBarId === barId.MORE) await this.model.getData(
        rootStore.transactionsStore.editItem.id)
    }

    get visible () {
      return this.props.formModel.toolBarId === barId.MORE && this.model.hasData
    }

    handleDuplicateUndo = async e => {
      const id = e.target.id
      await api.duplicateTransactionApi.undo(id)
      await this.model.getData()
      await rootStore.transactionsStore.getData()
    }

    render () {
      if (!this.visible) return null

      return <Duplicates items={this.model.items} handleClick={this.handleDuplicateUndo}/>
    }
  }
)

/**
 * Transactions marked as duplicate.
 * @return {JSX.Element}
 * @constructor
 */
let Duplicates = ({ items, handleClick }) => {
  return <>
    <h5>Duplicates</h5>
    {items.map(x =>
      <div key={x.id}>
        <div className='row'>
          <div className='col-sm-6'>{utils.formatDate(x.postedDate)}</div>
          <div className='col-sm-6'>{utils.formatAmount(x.amount)}</div>
        </div>
        <div>{x.description}</div>
        <div className='mb-2 pb-2 border-bottom'>
          <button id={x.id} className='btn btn-outline-primary' onClick={handleClick}>Not a duplicate</button>
        </div>
      </div>
    )}
  </>
}
Duplicates = observer(Duplicates)

export default More

