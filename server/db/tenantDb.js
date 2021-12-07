'use strict'

import Db from './db.js'

export default class TenantDb extends Db {
  constructor () {
    super('tenants')
  }
}
