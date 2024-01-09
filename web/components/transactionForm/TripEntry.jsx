'use strict'

import React from 'react'
import { observer } from 'mobx-react'
import {rootStore} from '../../stores/rootStore.js'

/**
 * @typedef {Object} TripEntryProps
 * @property {boolean} visible
 * @property {boolean} hasTrip
 * @property {number} distance
 * @property {function} onChange
 */

/**
 * Transaction trip input.
 * @param {Object} props
 * @param {Object} props.model
 * @return JSX.Element
 * @constructor
 */
let TripEntry = ({model}) => {
  if (!model.tripEntryVisible || !rootStore.masterDataStore.hasCars) return  null

  const hasTrip = rootStore.transactionsStore.editItem.tripDistance != null

  const handleChange = e => {
    rootStore.transactionsStore.setTripDistance(e.target.checked ? 0 : null)
  }

  const handleDistanceChange = e => {
    rootStore.transactionsStore.setTripDistance(e.target.value)
  }

  return <div className='row g-3 align-items-center mt-2'>
    <div className='col-auto'>
      <input
        id='hasTrip'
        name='hasTrip'
        key='hasTripCheckbox'
        type='checkbox'
        checked={hasTrip}
        onChange={handleChange}
      />
    </div>

    <div className='col-auto'>
      <label htmlFor='hasTrip' className='col-form-label'>Has a trip</label>
    </div>

    {hasTrip && <>
      <div hidden id='tripDistanceLabel' className='col-auto ms-auto'>
        <label htmlFor='tripDistance' className='col-form-label'>Distance:</label>
      </div>
      <div className='col-auto'>
        <input
          type='number'
          id='tripDistance'
          name='tripDistance'
          style={{ width: '70px' }}
          className='form-control'
          value={rootStore.transactionsStore.editItem.tripDistance}
          onChange={handleDistanceChange}
          aria-describedby='distance' />
      </div>
      <div className='col-auto'>ml</div>
    </>}
  </div>
}
TripEntry = observer(TripEntry)
export default TripEntry
