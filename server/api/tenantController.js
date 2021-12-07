'use strict'

import cuid from 'cuid'
import { UserDb, TenantDb } from '../db/index.js'
import { getLogger } from '../core/index.js'
import DataChangeLogic, { ops } from './dataChangeLogic.js'
import sha256 from 'crypto-js/sha256.js'
import { userModel } from '../../shared/models/index.js'
import { controller as categoryController } from './categoryController.js'

const logger = getLogger(import.meta.url)

const defaultSettings = JSON.stringify({})

const controller = {
  /**
   * Creates a new tenant.
   * @param {string} email
   * @param {string} password
   * @return {Promise<{user: User, tenant: *}>}
   */
  create: async (email, password) => {
    logger.info('create', { email })
    const tenantDb = new TenantDb()
    const userDb = new UserDb()
    const tenantId = cuid()

    const tenant = await tenantDb.insert({ id: tenantId, name: email, settings: defaultSettings })

    const user = userModel.getNew(tenantId, email, sha256(password).toString())
    await userDb.insert(user)

    await categoryController.insertDefaults(tenantId, user.id)

    const dataChangeLogic = new DataChangeLogic(tenantId, user.id)
    await dataChangeLogic.insert(tenantDb.tableName, tenantId, ops.INSERT, tenant)
    delete user.password
    await dataChangeLogic.insert(userDb.tableName, user.id, ops.INSERT, user)

    return { tenant, user }
  }
}

export {
  controller
}
