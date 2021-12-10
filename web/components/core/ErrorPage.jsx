'use strict'

import * as React from 'react'

/**
 * ErrorPage component.
 * @return {JSX.Element}
 */
const ErrorPage = () =>
  <section className='content error500'>
    <div className='errorDiv'>
      <h2 className='text-danger'>500</h2>
      <div className='errorContent'>
        <h3><i className='fas fa-exclamation-triangle text-danger' /> Oops! Something went wrong.</h3>
        <p>
          We will work on fixing that right away. <br/>
          Meanwhile, you may <a href='/'>return to the Home page</a>.
        </p>
      </div>
    </div>

  </section>

export default ErrorPage
