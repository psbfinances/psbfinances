'use strict'

import React, { useEffect } from 'react'
import BudgetToolbar from './BudgetToolbar.jsx'
import BudgetTable from './BudgetTable.jsx'
import BudgetForm from './BudgetForm.jsx'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import { budgetApi } from '@psbfinances/shared/apiClient/index.js'
import { rootStore } from '../../stores/rootStore.js'

/**
 * Budget view model.
 * {@link module:psbf/api/budget}
 * @class
 */
class BudgetModel {
  /** @type {CategoryAmount[]} */ items = []
  /** @type {{amounts: Number[]}} */ totals = { amounts: [] }
  formVisible = false
  year = (new Date()).getFullYear()
  hasBudget = false
  showZerros = false

  /** @type {string} */ selectedId
  editItem

  constructor () {
    makeAutoObservable(this)
  }

  setEditItem () {
    const selectedItem = this.selectedCategory
    this.editItem = {
      categoryId: selectedItem.categoryId,
      categoryName: selectedItem.categoryName,
      amounts: selectedItem.amounts.map(x => ({
        id: x.id,
        month: x.month,
        amount: x.amount,
        note: x.note
      }))
    }
  }

  handleSettingShowZerros = visible => this.showZerros = visible

  async getData () {
    await rootStore.masterDataStore.getData()
    /** @type {ListResponse} */
    const result = await budgetApi.list({ year: this.year })
    this.items = result.categoryMonthAmounts
    this.items.forEach(x => x.visible = true)
    this.totals = result.monthTotals
    this.selectedId = this.items[0].categoryId
    this.hasBudget = result.hasBudget
    this.setEditItem()
  }

  get selectedCategory () {
    if (!this.selectedId) return {}

    return this.items.find(x => x.categoryId === this.selectedId)
  }

  cancelEdit = () => {
    this.setEditItem()
    this.setFormVisible(false)
  }

  setFormVisible (visible) {
    this.formVisible = visible
    this.setEditItem()
  }

  save = async () => {
    const postData = this.editItem.amounts.filter(x => x.month > 0).map(x => ({
      id: x.id,
      year: this.year,
      monthNo: x.month,
      categoryId: this.selectedId,
      amount: x.amount,
      comment: x.note
    }))
    await budgetApi.post(postData)
    await this.getData()
    this.setFormVisible(false)
  }

  handleAmountChange = (value, name) => {
    if (isNaN(value)) return

    const monthNo = Number.parseInt(name.split('-')[1])
    this.editItem.amounts[monthNo].amount = Number.parseInt(value)
  }

  handleTotalChange = value => {
    if (isNaN(value)) return

    this.editItem.amounts[0].amount = Number.parseInt(value)
  }

  handleNoteChange = e => {
    const monthNo = Number.parseInt(e.target.id.split('-')[1])
    this.editItem.amounts[monthNo].note = e.target.value
  }

  handleAmountBlur = () => {
    const total = this.editItem.amounts.filter((x, i) => i > 0).reduce((t, x) => t + x.amount, 0)
    this.editItem.amounts[0].amount = Math.round(total)
  }

  handleFill = () => {
    const monthlyAmount = this.editItem.amounts[0].amount
    this.editItem.amounts[0].amount = Math.round(this.editItem.amounts[0].amount * 12)
    for (let i = 1; i < 13; i++) this.editItem.amounts[i].amount = monthlyAmount
  }

  handleYearChange = async (e) => {
    this.year = Number.parseInt(e.target.id)
    await this.getData()
  }

  handleAddClick = async () => {
    await budgetApi.post({ year: this.year })
    await this.getData()
  }
}

const model = new BudgetModel()

/**
 * Budget component.
 * @constructor
 */
const Budget = observer(({}) => {

  useEffect( () => {
    const getData = async () => await model.getData()
    getData()
  }, [])

  return <div id='dataContainer' className='dataContainer'>
    <BudgetToolbar model={model} />

    <div id='transactions' className='tableAndForm'>
      <BudgetTable model={model} />
      <BudgetForm model={model} />
    </div>

  </div>
})

export default Budget
