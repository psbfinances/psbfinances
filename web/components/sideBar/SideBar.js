'use strict'

import * as React from 'react'
import styled from 'styled-components'
import SideBarItem from './SideBarItem.js'

const navigationItems = [
  {
    id: 1,
    groupLabel: 'MAIN',
    items:
      [
        { label: 'Overview', link: '/app/overview', icon: 'fas fa-shopping-cart' },
        { label: 'Dashboard', link: '/app/dashboard', icon: 'fas fa-tachometer-alt' },
        { label: 'Tenants', link: '/app/tenants', icon: 'fas fa-cog' },
        { label: 'Settings', link: '/app/settings', icon: 'fa-cog' }]
  }
]

/**
 * VerticalNavigator component.
 */
class SideBar extends React.Component {
  render () {
    return (
      <SideBarContainer>
        <nav className='nav flex-column nav-pills'>
          {navigationItems.map((x, j) => (
            <div key={j}>
              <GroupLabel>{x.groupLabel}</GroupLabel>
              {x.items.map((y, i) => <SideBarItem key={i} {...y} />)}
            </div>)
          )}
        </nav>
      </SideBarContainer>
    )
  }
}

const SideBarContainer = styled.div`
  margin-top: 10px;
  width: 100%;
`
const GroupLabel = styled.div`
  margin-left: 12px;
  margin-bottom: 8px;
`

export default SideBar
