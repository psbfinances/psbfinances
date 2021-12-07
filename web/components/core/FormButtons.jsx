'use strict'

import React from 'react'

const FormButtons = ({model}) => {
  return <div className='col-form-label-sm'>
    <div className='mt-4 mb-3'>
      <div className='form-group mb-3'>
        <button onClick={model.save} className='btn btn-primary'>
          Save
        </button>
        <button onClick={model.undoEdit} className='btn btn-outline-danger ms-2'>
          Cancel
        </button>
        <button hidden={!model.deleteButtonVisible} onClick={model.handleDelete} className='btn btn-danger ms-2'>
          Delete
        </button>
      </div>
    </div>
  </div>
}

export default FormButtons
