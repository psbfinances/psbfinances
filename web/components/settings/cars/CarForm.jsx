'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import { InputField, FormButtons, CheckboxField } from '../../core/index.js'

/**
 * Car form.
 * @param {CarListModel} model
 * @return {JSX.Element|null}
 * @constructor
 */
let CarForm = ({ model }) => {
  if (!model.editItem) return null

  return <div>
    <div id='dataContainer' className='frm formDataContainer'>
      <div id='formContainer' data-testid='formContainer' className='formContainer'>

        <InputField
          label='Description'
          id='description'
          handleChange={model.handleChange}
          errors={model.formErrors}
          value={model.editItem.description} />

        <CheckboxField
          label='In use'
          id='isInUse'
          handleChange={model.handleChange}
          value={model.editItem.isInUse} />

        <FormButtons model={model} />
      </div>
    </div>
  </div>
}
CarForm = observer(CarForm)

export default CarForm
