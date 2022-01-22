'use strict'

import Db from './db.js'
import { getLogger } from '../core/index.js'

const logger = getLogger(import.meta.url)

const columns = {
  id: '',
  postedDate: '',
  accountId: '',
  categoryId: '',
  amount: '',
  businessId: '',
  description: '',
  originalDescription: '',
  sourceOriginalDescription: '',
  reconciled: '',
  deleted: '',
  note: '',
  scheduled: '',
  parentId: '',
  hasChildren: '',
  tripId: '',
  source: '',
  meta: ''
}

/**
 * @class
 * @extends Db
 */
export default class TransactionDb extends Db {
  constructor () {
    super('transactions')
  }

  /**
   *
   * @param {string} id
   * @param {string} tenantId
   * @param {string[]|string} columns
   * @return {Promise<psbf.Transaction|undefined>}
   */
  async get (id, tenantId, columns = listColumns) {
    return this.knex.where({ id, tenantId }).columns(columns).first()
  }

  /**
   * Gets existing transactions that can be a duplicate.
   * @param {string} tenantId
   * @param {string} id
   * @param {string} accountId
   * @param {Date} postedDate
   * @param {number} amount
   * @return {Promise<[psbf.Transaction[]]>}
   */
  async listDuplicateCandidates (tenantId, id, accountId, postedDate, amount) {
    return this.raw(`SELECT id, sourceOriginalDescription, originalDescription
      FROM transactions
      WHERE tenantId = ?
        AND id != ?
        AND accountId = ?
        AND amount = ?
        AND ABS(DATEDIFF(?, postedDate)) < 7;`,
      [tenantId, id, accountId, amount, postedDate])
  }

  async listByAccountDates ({ tenantId, categoryId, businessId, accountId, dateFrom, dateTo }) {
    const mainFields = Object.assign({ 'transactions.tenantId': tenantId },
      businessId ? { 'transactions.businessId': businessId } : {},
      accountId ? { accountId } : {},
      categoryId ? { categoryId } : {}
    )
    return this.knex.from(this.tableName).columns(listColumns).
      innerJoin('accounts', 'transactions.accountId', 'accounts.id').
      where(mainFields).
      where('accounts.visible', '=', 1).
      where(columns.postedDate, '>=', dateFrom).
      where(columns.postedDate, '<', dateTo).
      orderBy([{ column: columns.postedDate, order: 'desc' }, columns.originalDescription])
  }

  async listByAccountDatesWithSearch ({ tenantId, accountId, categoryId, dateFrom, dateTo, search, accountIds }) {
    let mainFields = { tenantId }
    if (categoryId) mainFields.categoryId = categoryId
    if (accountId) mainFields.accountId = accountId
    const query = this.knex.columns(listColumns).
      where(mainFields).
      where(columns.postedDate, '>=', dateFrom).
      where(columns.postedDate, '<', dateTo).
      orderBy([{ column: columns.postedDate, order: 'desc' }, columns.originalDescription])

    if (search) {
      const value = search.trim()
      if (value !== '') {
        query.whereIn('accountId', accountIds)
        if (isNaN(value)) {
          query.where(function () {
            this.where('description', 'like', `%${value}%`)
            this.orWhere('note', 'like', `%${value}%`)
          })
        } else {
          const amount = parseFloat(value) * 100
          query.whereRaw('ABS(amount) = ?', amount)
        }
      }
    }
    logger.debug('listByAccountDatesWithSearch', { query: query.toSQL().toNative() })
    return query
  }

  async listByDescription ({ tenantId, accountId, description }) {
    return this.knex.columns([columns.id, columns.description]).where({ tenantId, accountId, description })
  }

  /**
   * @param {string} tenantId
   * @param {string} parentId
   * @return {Promise<psbf.Transaction[]>}
   */
  async listByParentId ({ tenantId, parentId }) {
    return this.knex.columns(listCols).where({ tenantId, parentId }).orderBy([{ column: columns.id, order: 'asc' }])
  }

  async listUniqueDescription (tenantId, description) {
    return this.knex.where({ tenantId }).
      where('description', 'like', `${description}%`).
      distinct([columns.description])
  }

  async aggregateAmountByAccountDates ({ tenantId, accountId, dateFrom }) {
    return this.knex.
      sum('amount as total').
      where({ tenantId, accountId }).
      andWhere('postedDate', '<', dateFrom)
  }

  /**
   *
   * @param {string} externalUid
   * @param {string} tenantId
   * @return {string[]}
   */
  async getByExternalUid (externalUid, tenantId) {
    return this.knex.columns(['id']).where({ externalUid, tenantId }).select()
  }

  async getTotalAmountByAccount (accountId, tenantId) {
    return this.knex.where({tenantId, accountId}).sum('amount as total')
  }

  async getDuplicate ({ id, ...rest }) {
    return this.knex.where(rest).whereNot({ id }).select(columns.id)
  }

  async updateDescriptions (ids, tenantId, description) {
    return this.knex.whereIn(columns.id, ids).where({ tenantId }).update({ description })
  }

  async updateMeta (id, tenantId, meta) {
    return this.knex.where({ id, tenantId }).update({ meta: JSON.stringify(meta) })
  }

  async deleteByParentId (parentId, tenantId) {
    return this.knex.where({ parentId, tenantId }).delete()
  }
}

Db.populateColumnNames(columns)

const listCols = [
  columns.id,
  columns.postedDate,
  columns.accountId,
  columns.categoryId,
  columns.amount,
  columns.businessId,
  columns.description,
  columns.originalDescription,
  columns.sourceOriginalDescription,
  columns.reconciled,
  columns.deleted,
  columns.source,
  columns.scheduled,
  columns.parentId,
  columns.hasChildren,
  columns.tripId,
  columns.note,
  columns.meta
]
const listColumns = listCols.map(x => `transactions.${x}`)
