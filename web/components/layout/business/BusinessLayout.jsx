'use strict'

import * as React from 'react'
import { Route, Routes } from 'react-router'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Avatar from 'react-avatar'
import ErrorBoundary from '../../core/ErrorBoundary'
import Overview from '../../overview/Overview'
import appController from '../../../../shared/core/appController.js'
import TenantList from '../../tenants/TenantList.jsx'
import TransactionList from '../../transactionList/TransactionList.jsx'
import Dashboard from '../../dashboard/Dashboard.jsx'
import ReportList from '../../reports/ReportList.jsx'
import Budget from '../../budget/Budget.jsx'
import { observer } from 'mobx-react'
import {
  Settings,
  AccountList,
  ImportList,
  UserList,
  BusinessList,
  CategoryList,
  ImportRuleList
} from '../../settings/index.js'
import { ErrorPage } from '../../core/index.js'
import { useEffect } from 'react'
import * as api from '../../../../shared/apiClient'
import { rootStore } from '../../../stores/rootStore.js'
import classNames from 'classnames'
import CarList from '../../settings/cars/CarList.jsx'
import DuplicateList from '../../settings/duplicateTransactions/DuplicateList.jsx'
import ApplicationSettingsForm from '../../settings/application/ApplicationSettings.jsx'
import BusinessYearTaxes from '../../reports/BusinessYearTaxes.jsx'
import { configure } from "mobx"

// configure({
//   enforceActions: "always",
//   computedRequiresReaction: true,
//   reactionRequiresObservable: true,
//   observableRequiresReaction: true,
//   disableErrorBoundaries: true
// })

const MustBeAuthenticated = ({ children }) => {
  const navigate = useNavigate()
  useEffect(() => {
    if (!appController.authenticated) navigate('/auth')
  }, [])

  return children
}

/**
 * Business Layout component.
 */
// const BusinessLayout = observer(
  class BusinessLayout extends React.Component {
    render () {
      return <ErrorBoundary>
        <MustBeAuthenticated>
          <div id='appMain' className='appFullPage'>
            <div id='mainLayer' className='mainLayer'>
              <div id='appContent' className='appContent'>
                <Header />
                <div id='dataContainer' className='dataContainer'>
                  <Routes>
                    <Route path='error' element={<ErrorPage />} />
                    <Route path='overview' element={<Overview />} />
                    <Route path='tenants' element={<TenantList />} />
                    <Route path='transactions' element={<TransactionList />} />
                    <Route path='dashboard' element={<Dashboard />} />
                    <Route path='budget' element={<Budget />} />
                    <Route path='reports' element={<ReportList />} />
                    <Route path='reports/year-taxes' element={<BusinessYearTaxes />} />
                    <Route exact path='settings' element={<Settings />} />
                    <Route path='settings/applicationSettings' element={<ApplicationSettingsForm />} />
                    <Route path='settings/accounts' element={<AccountList />} />
                    <Route path='settings/businesses' element={<BusinessList />} />
                    <Route path='settings/categories' element={<CategoryList />} />
                    <Route path='settings/cars' element={<CarList />} />
                    <Route path='settings/duplicateTransactions' element={<DuplicateList />} />
                    <Route path='settings/imports' element={<ImportList />} />
                    <Route path='settings/importRules' element={<ImportRuleList />} />
                    <Route path='settings/users' element={<UserList />} />
                  </Routes>
                </div>
              </div>
            </div>
          </div>
        </MustBeAuthenticated>
      </ErrorBoundary>
    }
  }//)

/**
 * Business layout header.
 * @return {JSX.Element}
 * @constructor
 */
const Header = () => {
  const navigate = useNavigate()

  const handleLogout = async e => {
    e.preventDefault()
    await api.authApi.logout()
    appController.logout()
    rootStore.init()

    navigate('/')
  }

  return <>
    <div id='header' className='header'>
      <div className='logo-div'>
        PSBF
      </div>
      <div className='d-none d-sm-none d-md-block'>
        <NavItems />
      </div>
      <div id='navRight'>
        <div>
          {appController.authenticated
            ? <Avatar
              name={appController.user.nickname}
              size='30' color='white' fgColor='#B88766' round={true} />
            : null}
          <Link
            to='/'
            onClick={handleLogout}
            style={{ marginLeft: '10px', color: 'white' }}
            className='btn btn-link'><i className='fas fa-sign-out-alt'/></Link>

        </div>
      </div>
    </div>
    <div className='d-sm-block d-md-none'>
      <NavItems />
    </div>

  </>
}

const NavItems = () => {
  return <ul className='nav justify-content-center'>
    <HeaderNavItem label='Transactions' icon='fa-table' url='/app/transactions' />
    <HeaderNavItem label='Dashboard' icon='fa-tachometer-alt' url='/app/dashboard' />
    <HeaderNavItem label='Budget' icon='fa-book' url='/app/budget' />
    <HeaderNavItem label='Reports' icon='fa-file' url='/app/reports' />
    <HeaderNavItem label='Settings' icon='fa-cog' url='/app/settings' />
  </ul>
}
/**
 * Header navigation item.
 * @param {string} label
 * @param {string} icon
 * @param {string} url
 * @return {JSX.Element}
 * @constructor
 */
const HeaderNavItem = ({ label, icon, url }) => <li className='nav-item'>

  <NavLink className='nav-link' aria-current='page' to={url} style={{textAlign: 'center'}}>
    <div><i className={classNames('fas', icon)} style={{color: 'white'}}/></div>
    {label}
  </NavLink>
</li>

export default BusinessLayout
