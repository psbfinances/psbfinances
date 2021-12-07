'use strict'

import Db from './db.js'

export default class AttachmentDb extends Db {
  constructor () {
    super('attachments')
  }

  /**
   * Gets list of the entity attachments.
   * @param {string} tenantId
   * @param {string} entityId
   * @return {Promise<psbf.Attachment[]>}
   */
  async listByEntity(tenantId, entityId) {
    return this.knex.from(this.tableName).
      where({tenantId}).
      where({entityId}).
      orderBy([{ column: 'id', order: 'desc' }])
  }

  /**
   *
   * @param {psbf.Attachment} data
   * @return {Promise<*>}
   */
  async insert(data) {
    const dbData = {...data}
    if (data.meta) dbData.meta = JSON.stringify(data.meta)
    if (data.fileInfo) dbData.fileInfo = JSON.stringify(data.fileInfo)
    return this.knex.insert(dbData)
  }
}
