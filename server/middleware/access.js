'use strict'

// noinspection ES6PreferShortImport
import { initConfig } from '../config/index.js'
import { c } from '../../shared/core/index.js'
import { getLogger } from '../core/index.js'
import { AccountDb, CategoryDb, BusinessDb } from '../db/index.js'

const logger = getLogger(import.meta.url)

const forbidden = (res, fields) => {
  logger.warn('forbidden', {...fields})
  return res.sendStatus(403)
}

export default {
  /**
   *
   * @param {AppRequest} req
   * @param {Response} res
   * @param {function} next
   * @return {Promise<void>}
   */
  authorize: async (req, res, next) => {
    // DEBUG
    await initConfig()

    const params = { ...req.params, ...req.body, ...req.query }
    const { accountId, categoryId, businessId } = params
    const tenantId = req.user.tenantId
    const userId = req.user.id
    const fields = { url: req.url, userId, tenantId, accountId, categoryId, businessId }
    logger.debug('authorize', fields)

    let items = []

    // TODO does this opens for security issue?
    if (accountId && accountId !== '-1') {
      const accountDb = new AccountDb()
      items = await accountDb.get(accountId, tenantId)
      if (items.length === 0) return forbidden(res, fields)
    }

    if (categoryId && categoryId !== '-1') {
      const categoryDb = new CategoryDb()
      items = await categoryDb.get(categoryId, tenantId)
      if (items.length === 0) return forbidden(res, fields)
    }

    if (businessId && businessId !== c.PERSONAL_TYPE_ID) {
      const businessDb = new BusinessDb()
      items = await businessDb.get(businessId, tenantId)
      if (items.length === 0) return forbidden(res, fields)
    }

    next()
  }
}
