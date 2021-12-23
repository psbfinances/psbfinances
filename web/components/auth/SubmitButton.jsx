'use strict'

import React from 'react'
import { observer } from 'mobx-react'

/**
 * Footer with submit button.
 * @param {AuthModel} model
 * @param {React.ReactElement} children
 */
let SubmitButton = ({ model, children }) => {
  return <div className='authFooter'>
    <button
      id='loginButton'
      disabled={!model.submitButtonEnabled}
      className='btn'
      onClick={model.handleSubmit}
    >{model.submitButtonLabel}
    </button>
    {children}
  </div>
}
SubmitButton = observer(SubmitButton)

export default SubmitButton
