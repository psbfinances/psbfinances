'use strict'

import Db from './db.js'

export default class BudgetDb extends Db {
  constructor () {
    super('budgets')
  }

  async listByYearAndMonth (tenantId, year, monthNo, monthOnly = true) {
    const query = monthOnly
      ? this.knex.where({ tenantId, year, monthNo })
      : this.knex.where({ tenantId, year}).andWhere('monthNo', '<=', monthNo)
    return query.
      columns(['id', 'categoryId', 'amount', 'comment']).
      select()
  }
}
