'use strict'

import React from 'react'
import { IconButton } from '../core'

/**
 * @typedef {Object} SettingsListToolbarModel
 * @property {string} title
 * @property {function} add
 * @property {function} getData
 */

/**
 * Settings list toolbar.
 * @param {SettingsListToolbarModel} model
 * @param children
 * @return {JSX.Element}
 * @constructor
 */
const ListToolbar = ({ model, children }) => {
  return <div id='toolbar' className='pageToolbar'>
    {children}
    <div className='row row-cols-md-auto g-3 align-items-center' style={{ width: '100%' }}>


      <IconButton label='refresh' icon='fas fa-plus-square' handleClick={model.add} />
      <IconButton label='refresh' icon='fas fa-sync' handleClick={model.getData} />
      <h5 style={{ marginLeft: 'auto' }}>{model.title}</h5>
    </div>
  </div>
}
export default ListToolbar
