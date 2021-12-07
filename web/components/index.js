'use strict'

import * as React from 'react'
import ReactDOM from 'react-dom'
import AppRoutes from './routes.js'
import './appStyle.css'

/**
 * Initializes react components.
 * @return {void}
 */
function init () {
  ReactDOM.render(<AppRoutes />, document.getElementById('root'))
}

init()
