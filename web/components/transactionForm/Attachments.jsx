'use strict'

import React from 'react'
import { StyledDropzone } from '../core'
import * as api from '../../../shared/apiClient'
import { rootStore } from '../../stores/rootStore'

/**
 * File upload and list controls
 */
export default class Attachments extends React.Component {
  /** @type {File} */ file
  state = {
    items: []
  }

  constructor (props) {
    super(props)
    this.file = null
    this.state = {
      items: []
    }
  }

  async componentDidMount () {
    const items = await api.transactionApi.listAttachments(this.props.transactionId)
    this.setState({ items })
  }

  handleDelete = async e => {
    const id = e.target.id
    await api.transactionApi.deleteAttachment(this.props.transactionId, id)
    const items = this.state.items.filter(x => x.id !== id)
    if (items.length === 0) rootStore.transactionsStore.selectedItem.meta.hasAttachment = false
    this.setState({ items })
  }

  handleDroppedFile = (file) => {
    this.file = file
  }

  handleImport = async () => {
    if (!this.file) return Promise.resolve()

    const formData = new FormData()
    formData.append('attachmentFile', this.file)
    formData.append('transactionId', this.props.transactionId)
    const result = await api.transactionApi.postAttachment(this.props.transactionId, formData)

    const { attachmentId, url } = result.data
    const items = [...this.state.items, { id: attachmentId, url }]
    if (!rootStore.transactionsStore.selectedItem.meta) rootStore.transactionsStore.selectedItem.meta = {}
    rootStore.transactionsStore.selectedItem.meta.hasAttachment = true
    this.setState({ items })
  }

  render () {
    return <>
      <div className='col-form-label-sm'>
        <label className='mb-2'>Add file</label>
        <StyledDropzone handleDrop={this.handleDroppedFile} />
      </div>

      <div className='mt-4 mb-3'>
        <div className='form-group mb-3'>
          <button onClick={this.handleImport} className='btn btn-primary'>Save</button>
        </div>
      </div>
      <hr />
      <div>
        {this.state.items.map(x => <AttachmentItem key={x.id} fileInfo={x} handleDelete={this.handleDelete} />)}
      </div>
    </>
  }
}

/**
 * File list item.
 * @param  fileInfo
 * @param {function} handleDelete
 * @return {JSX.Element}
 * @constructor
 */
const AttachmentItem = ({ fileInfo, handleDelete }) => {
  const handleFileViewClick = () => {
    const url = `${window.location.origin}${fileInfo.url}`
    window.open(url, '_blank')
  }

  return <>
    <div className='pb-2 mb-2 border-bottom'>
      <i className='far fa-file-image pe-auto fileIcon' onClick={handleFileViewClick} />
      <i id={fileInfo.id} className='far fa-trash-alt text-danger float-end fileDeleteIcon' onClick={handleDelete} />
    </div>
  </>
}
