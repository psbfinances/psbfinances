'use strict'

import * as React from 'react'
import ErrorPage from './ErrorPage'

/**
 * ErrorBoundary component.
 */
class ErrorBoundary extends React.Component {
  state = {
    hasError: false
  }

  static getDerivedStateFromError () {
    return { hasError: true }
  }

  componentDidCatch () {
    this.setState({ hasError: true })
  }

  componentDidUpdate () {
    this.setState({ hasError: false })
  }

  render () {
    if (this.state.hasError) return <ErrorPage />

    return this.props.children
  }
}

export default ErrorBoundary
