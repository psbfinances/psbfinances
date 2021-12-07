'use strict'

import React, { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import * as api from '../../../shared/apiClient'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'

/**
 *
 * @param description
 * @param handleDescriptionChange
 * @param hasData
 * @return {JSX.Element}
 * @constructor
 */
let DescriptionAutoComplete = React.forwardRef(({ id, description, handleChange }, ref) => {
  // console.log('[DAC] DescriptionAutoComplete', description)
  const fieldId = id || 'description'
  const getDefaultSelections = descriptionValue => [{ description: descriptionValue }]

  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState(getDefaultSelections(description))
  const [selected, setSelected] = useState(options)
  const prevDescription = useRef(description)

  const handleSearch = async (query) => {
    setIsLoading(true)

    const items = await api.transactionApi.listDescriptionsLookup(query)

    setOptions(items)
    setIsLoading(false)
  }

  useEffect(() => {
    if (description !== prevDescription.current) {
      prevDescription.current = description
      setOptions(getDefaultSelections(description))
      setSelected(getDefaultSelections(description))
    }
  })

  const filterBy = () => true

  const handleSelectedChange = selected => {
    if (selected[0] === description) return

    setSelected(selected)
  }

  const handleBlur = () => {
    handleChange(selected[0])
  }

  const renderItem = option => <span>{option.description || ''}</span>
  return <AsyncTypeahead
    isInvalid={false}
    allowNew={true}
    ref={ref}
    id={fieldId}
    filterBy={filterBy}
    name={fieldId}
    isLoading={isLoading}
    labelKey='description'
    minLength={3}
    placeholder="Search for a description..."
    onChange={handleSelectedChange}
    onBlur={handleBlur}
    inputProps={
      { id: fieldId }
    }
    selected={selected}
    onSearch={handleSearch}
    options={options}
    renderMenuItemChildren={renderItem}
  />
})

DescriptionAutoComplete = observer(DescriptionAutoComplete)
export default DescriptionAutoComplete

