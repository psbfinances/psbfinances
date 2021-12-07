'use strict'

import cuid from 'cuid'

const tripModel = {
  /**
   *
   * @param carId
   * @param description
   * @param startDate
   * @param distance
   * @return {Trip}
   */
  getNew: (carId, description, startDate, distance) => {
    return {
      id: cuid(),
      carId,
      description,
      startDate,
      endDate: startDate,
      distance
    }
  }
}

export default tripModel
