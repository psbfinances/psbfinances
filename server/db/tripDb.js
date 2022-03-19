'use strict'

import Db from './db.js'

export default class TripDb extends Db {
  constructor () {
    super('trips')
  }

  /**
   * Returns total business mileage for a date range.
   * @param {string} tenantId
   * @param {string} businessId
   * @param {string} dateFrom
   * @param {string} dateTo
   * @return {Promise<{totalDistance: number}[]>}
   */
  async calcTotalByBusinessAndDates (tenantId, businessId, dateFrom, dateTo) {
    return this.raw(`SELECT SUM(distance) AS totalDistance
      FROM trips
      INNER JOIN transactions ON trips.transactionId = transactions.id
      WHERE trips.tenantId = ? AND businessId = ? AND startDate >= ? AND endDate < ?;`,
      [tenantId, businessId, dateFrom, dateTo])
  }

  async insert (data) {
    const dbData = { ...data }
    if (data.meta) dbData.meta = JSON.stringify(data.meta)
    return this.knex.insert(dbData)
  }
}
