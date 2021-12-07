'use strict'

import * as React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import PlainLayout from './layout/plain/PlainLayout.jsx'
import Auth from './auth/Auth.jsx'
import BusinessLayout from './layout/business/BusinessLayout.jsx'
import { appController } from '../../shared/core/index.js'
import styled from 'styled-components'
import Temp from './Temp.jsx'
import TestComponent from './test/Test.jsx'

appController.load()

/**
 * Client router.
 * @returns {JSX.Element}
 */
const AppRoutes = () =>
  <RootWrapper id='rootWrapper'>
    <Router>
      <Routes>
        <Route exact path='/' element={<PlainLayout><Auth/></PlainLayout>} />
        <Route path='/home' element={<Temp />} />
        <Route path='/test' element={<TestComponent />} />
        <Route path='/app/*' element={<BusinessLayout />}>
        </Route>

      </Routes>
    </Router>
  </RootWrapper>

const RootWrapper = styled.div`
`

export default AppRoutes
