'use strict'

import Db from './db.js'

export default class ImportRuleTransactionDb extends Db {
  constructor () {
    super('importRuleTransactions')
  }
}
