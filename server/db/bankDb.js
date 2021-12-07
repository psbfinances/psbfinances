'use strict'

import Db from './db.js'

export default class BankDb extends Db {
  constructor () {
    super('banks')
  }
}
