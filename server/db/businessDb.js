'use strict'

import Db from './db.js'

export default class BusinessDb extends Db {
  constructor () {
    super('businesses')
  }
}
