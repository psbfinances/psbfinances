'use strict'

import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import classNames from 'classnames'

/**
 * SideBar Navigation item component.
 * @param {Object} props
 * @param {string} props.link
 * @param {string} props.label
 * @param {string} props.icon
 * @return {JSX.Element}
 */
const SideBarItem = ({ icon, link, label }) =>
  <li className='nav-item'>
    <NavBarLink to={link} className='nav-link' activeStyle={activeStyle}>
      <i className={classNames('fa', 'fa-lg', 'fa-fw mr-2', icon)} />
      {label}
    </NavBarLink>
  </li>

const activeStyle = {
  // color: '#343a40',
  // color: '',
  color: '#202124',
  fontWeight: 'bold',
  backgroundColor: 'rgb(232, 234, 237)'
}

const NavBarLink = styled(NavLink)`
  border-radius: 4px;
  font-size: 14px;
  /*color: #c2c7d0;*/
  color: #202124;
  margin-bottom: 2px;
  &:hover {
    color: white;
    background-color: #c1cdda;
  }
`

export default SideBarItem
