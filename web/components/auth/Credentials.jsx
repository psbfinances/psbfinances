'use strict'

import { observer } from 'mobx-react'
import React from 'react'
import { Email, Error, Password } from './Fields.jsx'

/**
 * Credentails form.
 * @param {AuthModel} model
 * @returns {JSX.Element}
 * @constructor
 */
let Credentials = ({ model }) => {
  return <div style={{ padding: '20px 20px 5px 20px' }}>
    <Email model={model} />
    <Password model={model} />
    <Error model={model} />
  </div>
}
Credentials = observer(Credentials)

export default Credentials
