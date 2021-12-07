'use strict'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
// import classNames from 'classnames'
// import update from 'immutability-helper'
import Toolbar from '../core/PageToolbar.jsx'
import InputField from '../core/InputField.jsx'
import FormError from '../core/FormError.jsx'
import { tenantApi } from '../../../shared/apiClient/index.js'
import { Tenant } from '../../../shared/models/index.js'

const breadcrumbs = [
  { label: 'Tenants', url: '/app/tenants' },
  { label: 'Tenant Details' }
]

function handleClick () {}

// TODO resolve type def issue
const config = {
  search: {
    visible: false
  },
  pagination: {
    visible: false
  },
  buttons: [
    { label: 'New', handleClick },
    { label: 'Delete', handleClick, style: 'btn-danger' }
  ]
}

/**
 * Tenant details view and edit form.
 */
const TenantDetails = props => {
  console.log({ code: 'main', props })
  /**
   * @type {[Tenant, function]}
   */
  const [tenant, setTenant] = useState({})
  // const [hasData, setHasData] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (saving) return

    try {
      const [name, shortName] = e.target

      // TODO: name -> fullName
      /** @type {Tenant} */
      const updatedTenant = new Tenant()
      updatedTenant.fullName = name.value.trim()
      updatedTenant.shortName = shortName.value.trim()
      console.log({ code: 'handleSubmit', updatedTenant })
      const { hasError, errors: err } = updatedTenant.validate()
      if (hasError) {
        setErrors(err)
      } else {
        await tenantApi.update(tenant)
        setErrors({})
        setSaving(false)
      }
    } catch (err) {
      console.error({ code: 'handleSubmit', err })
      setErrors({ ...errors, form: err.message })
      // TODO show error: UI + UX (what should be user options of how to handle error). How to remove error Alert when
      // user starts to type something.
    }
  }

  const handleEffect = () => {
    const runHandler = async () => {
      const id = props.match.params.id
      console.log({ code: 'handleEffect', id })
      const tenant = await tenantApi.get(id)
      setTenant(tenant)
    }

    runHandler().then(() => {})
  }

  useEffect(handleEffect)
  console.log({ code: 'main', tenant })

  return (
    <>
      <div id='pageHeader'>
        <Breadcrumb items={breadcrumbs} />
        <Toolbar config={config} />
      </div>

      <DataContainer>
        <FormContainer>
          <form onSubmit={handleSubmit} id='loginForm'>
            <InputField id='shortName' value={tenant.shortName} label='Short Name' autoFocus errors={errors} />
            <InputField
              id='fullName' label='Name' value={tenant.fullName} placeholder='Tenant full name' errors={errors}
            />
            <FormError message={errors.form} />
            <button type='submit' className='btn btn-primary btn-sm'>Save</button>
          </form>
        </FormContainer>
      </DataContainer>
    </>
  )
}

const DataContainer = styled.div`
background-color: white;
`

const FormContainer = styled.div`
border: 1px solid rgba(0, 0, 0, 0.125);
border-radius: 4px;
padding: 10px;
`

export default TenantDetails
