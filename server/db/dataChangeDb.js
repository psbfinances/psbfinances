'use strict'

import Db from './db.js'

export default class DataChangeDb extends Db {
  constructor () {
    super('dataChanges')
  }

  async insert(data) {
    const dbData = {...data}
    dbData.data = JSON.stringify(data.data)
    return this.knex.insert(dbData)
  }
}

