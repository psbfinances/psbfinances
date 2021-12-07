'use strict'

import Db from './db.js'

export default class CarDb extends Db {
  constructor () {
    super('cars')
  }
}
