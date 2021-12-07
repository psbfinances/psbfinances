'use strict'

import Db from './db.js'

export default class TripDb extends Db {
  constructor () {
    super('trips')
  }

  async insert(data) {
    const dbData = {...data}
    if (data.meta) dbData.meta = JSON.stringify(data.meta)
    return this.knex.insert(dbData)
  }
}
