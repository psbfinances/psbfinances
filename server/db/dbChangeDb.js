'use strict'

import Db from './db.js'

export default class DbChangeDb extends Db {
  constructor () {
    super('dbChanges')
  }
}

