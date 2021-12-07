'use strict'

import React from 'react'
import { IconButton } from '../../core/index.js'

const ImportListToolbar = ({handleRefreshClick}) => {
  return <div id='toolbar' className='pageToolbar'>
      <div className='row row-cols-md-auto g-3 align-items-center' style={{width: '100%'}}>


        <IconButton label='refresh' icon='fas fa-sync' handleClick={handleRefreshClick} />
        <h5 style={{marginLeft: 'auto'}}>IMPORTS</h5>
      </div>
  </div>
}

export default ImportListToolbar
