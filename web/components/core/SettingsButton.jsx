'use strict'

import { IconButton } from './index.js'
import React from 'react'

const SettingsButton = ({handleClick}) => <IconButton
  label='settings'
  tooltip='Settings'
  icon='fas fa-cog'
  handleClick={handleClick}
/>

export default SettingsButton

