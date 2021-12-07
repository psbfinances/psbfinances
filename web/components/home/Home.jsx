'use strict'

import * as React from 'react'
import { Redirect } from 'react-router'

/**
 * Home component.
 */
class Home extends React.Component {
  state = {
    homeUrl: '/'
  }

  render () {
    if (this.state.homeUrl === '') return null

    return <Redirect to={this.state.homeUrl} />
  }
}

export default Home
