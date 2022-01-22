'use strict'

import knexDb from 'knex'
import { config } from '../config/index.js'

let knexPool

/**
 * @class
 */
export default class Db {
  constructor (tableName) {
    if (!knexPool) {
      knexPool = knexDb({
        client: 'mysql',
        connection: {
          host: config.mysql.server,
          user: config.mysql.user,
          password: config.mysql.password,
          database: config.mysql.database
        },
        pool: { min: 1, max: 10 }
      })
    }
    this.pCol = {
      id: 'id',
      tenantId: 'tenantId'
    }
    this.tableName = tableName
  }

  /**
   * Sets values for the column keys.
   * @param {Object} columns
   */
  static populateColumnNames(columns) {
    Object.keys(columns).forEach(x => columns[x] = x)
  }

  get knex() {
    return knexPool(this.tableName)
  }

  async insert(data) {
    return this.knex.insert(data)
  }

  async list(tenantId) {
    return this.knex.where({ tenantId }).select()
  }

  async get(id, tenantId) {
    return this.knex.where({ id, tenantId }).select()
  }

  async update({ id, tenantId, ...fields }) {
    return this.knex.where({ id, tenantId }).update(fields)
  }

  async raw(query, params) {
    return (await knexPool.raw(query, params))[0]
  }
  async rawDDL(query) {
    return knexPool.raw(query)
  }

  async delete(params) {
    return this.knex.where(params).delete()
  }
}

