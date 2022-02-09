'use strict'

import React, { useState } from 'react'
import { IconButton, PeriodSelector, SettingsButton, SettingsContainer } from '../core/index.js'
import { observer } from 'mobx-react'
import Modal from 'react-modal'
import Switch from 'react-switch'

// noinspection JSUnresolvedFunction
Modal.setAppElement('#root')

/**
 * Budget toolbar.
 * @param {BudgetModel} model
 * @return {JSX.Element}
 * @constructor
 */
const BudgetToolbar = observer(({ model }) => {
  const [settingsVisible, setSettingsVisible] = useState(false)

  const handleSettingsClick = () => {
    setSettingsVisible(true)
    if (model.formVisible) model.setFormVisible(false)
  }

  const handleSettingsCloseClick = () => setSettingsVisible(false)

  return <div id='toolbar' className='pageToolbar'>
    {/*<Settings model={model} modalVisible={modalVisible} handleSettingsCloseClick={handleSettingsCloseClick} />*/}
    <SettingsContainer
      header='Customize'
      model={model}
      visible={settingsVisible}
      handleCloseClick={handleSettingsCloseClick}>
      <div className='settingsGroup'>
        <label className='settingGroupLabel'>Show categories with $0 balance</label>
        <label className='settingsGroupValue'>
          <Switch
            onChange={model.handleSettingShowZerros}
            checked={model.showZerros}
            className='react-switch'
            checkedIcon={false}
            uncheckedIcon={false} />
        </label>
      </div>
    </SettingsContainer>
    <div>
      <div className='row row-cols-md-auto g-3 align-items-center'>
        <PeriodSelector
          selectedYear={model.year.toString()}
          handleChange={model.handleYearChange} />

        <IconButton
          label='add'
          tooltip='Copy budget from previous year'
          icon='fas fa-plus-square'
          disabled={model.hasBudget}
          handleClick={model.handleAddClick}
        />

        <SettingsButton handleClick={handleSettingsClick} />
      </div>
    </div>
  </div>

})

/**
 * Budget settings dialog.
 * @param {BudgetModel} model
 * @param {boolean} modalVisible
 * @param {function} handleSettingsCloseClick
 * @return {JSX.Element|null}
 * @constructor
 */
let Settings = ({ modalVisible, model, handleSettingsCloseClick }) => {
  if (!modalVisible) return null

  return <Modal
    isOpen={modalVisible}
    className='settingsModal'
    overlayClassName='settingsOverlay'
  >
    <div className='settingsContainer'>
      <h3>Customize</h3>
      <div className='settingCloseButton'>
        <IconButton icon='fas fa-times' handleClick={handleSettingsCloseClick} />
      </div>
    </div>
    <div className='settingsGroup'>
      <label className='settingGroupLabel'>Show categories with $0 balance</label>
      <label className='settingsGroupValue'>
        <Switch
          onChange={model.handleSettingShowZerros}
          checked={model.showZerros}
          className='react-switch'
          checkedIcon={false}
          uncheckedIcon={false} />
      </label>
    </div>
  </Modal>
}
Settings = observer(Settings)
export default BudgetToolbar
