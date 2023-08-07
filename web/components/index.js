'use strict'

import * as React from 'react'
import { createRoot } from 'react-dom/client';
import AppRoutes from './routes.js'
import './appStyle.css'

/**
 * Initializes react components.
 * @return {void}
 */
function init () {
  const container = document.getElementById('root')
  const root = createRoot(container)
  root.render(<AppRoutes tab="home" />);
}

init()
