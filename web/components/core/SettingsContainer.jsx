'use strict'

import Modal from 'react-modal'
import { IconButton } from './index.js'
import { observer } from 'mobx-react'
import React from 'react'

// noinspection JSUnresolvedFunction
Modal.setAppElement('#root')

/**
 * Settings container for lists & dashboard.
 * @param {Object} model
 * @param {boolean} visible
 * @param {function} handleCloseClick
 * @param {string} header
 * @return {JSX.Element|null}
 * @constructor
 */
let SettingsContainer = ({ header, visible, handleCloseClick,  children }) => {
  if (!visible) return null

  return <Modal
    isOpen={visible}
    className='settingsModal'
    overlayClassName='settingsOverlay'
  >
    <div className='settingsContainer'>
      <h3>{header}</h3>
      <div className='settingCloseButton'>
        <IconButton icon='fas fa-times' handleClick={handleCloseClick} />
      </div>
    </div>
    {children}
  </Modal>
}
SettingsContainer = observer(SettingsContainer)

export default SettingsContainer
