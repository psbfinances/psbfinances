'use strict'

import { DataChangeDb } from '../db/index.js'
import { getLogger } from '../core/index.js'

const logger = getLogger(import.meta.url)

class DataChangeLogic {
  /**
   *
   * @param {string} tenantId
   * @param {string} userId
   */
  constructor (tenantId, userId) {
    this.dataChange = {
      tenantId,
      entryDateTime: new Date(),
      userId
    }
  }

  /**
   * Inserts data change entry.
   * @param {string} entity - table name
   * @param {string} dataId - record id from the changed table
   * @param {'i'|'u'|'d'} operation
   * @param {Object} data
   * @return {Promise<void>}
   */
  async insert (entity, dataId, operation, data) {
    const dataChange = Object.assign(this.dataChange, { entity, dataId, operation, data: JSON.stringify(data) })

    logger.debug('insert', dataChange)
    try {
      const dataChangesDb = new DataChangeDb()
      await dataChangesDb.insert(dataChange)
    } catch (e) {
      logger.error('insert', { dataChange, e })
    }
  }
}

/**
 * @readonly
 * @enum {string}
 */
const ops = {
  INSERT: 'i',
  UPDATE: 'u',
  DELETE: 'd'
}

export default DataChangeLogic
export {
  ops
}
