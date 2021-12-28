'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'
import cuid from 'cuid'
import  NodeCache from 'node-cache'
import { UserDb } from '../db/index.js'
import utils from './utils.js'
import DataChangeLogic, { ops } from './dataChangeLogic.js'
import { userModel } from '../../shared/models/index.js'

const cache = new NodeCache()

const controller = {
  /**
   * Gets tenant users
   * @property {AppRequest} req
   * @property {Response} response
   * @return {Array<FinancialAccount>}
   */
  list: async (req, res) => {
    const db = new UserDb()
    let rows = await db.list(req.user.tenantId)
    res.json(rows)
  },

  /**
   * Saves a new user.
   * @property {AppRequest} req
   * @property {User} req.body
   * @property {Response} response
   * @return {User|Object}
   */
  insert: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)

    const user = req.body
    const errors = userModel.validate(user)
    if (Object.keys(errors).length > 0) return res.json({ errors })

    user.id = cuid()
    user.tenantId = tenantId
    const userDb = new UserDb()
    await userDb.insert(user)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(userDb.tableName, id, ops.INSERT, user)
    res.json(user)
  },

  /**
   * Updates existing user.
   * @property {AppRequest} req
   * @property {User} req.body
   * @property {Response} response
   * @return {User|Object}
   */
  update: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    /** @type {User} */
    const user = req.body
    const errors = userModel.validate(user)
    if (Object.keys(errors).length > 0) return res.json({ errors })

    const userDb = new UserDb()
    await userDb.update({ id, tenantId, ...user })

    cache.del(utils.getUserCacheKey(user.email))

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(userDb.tableName, id, ops.UPDATE, user)

    res.json({ account: user })
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/').get(asyncHandler(controller.list))
router.route('/').post(asyncHandler(controller.insert))
router.route('/:id').put(asyncHandler(controller.update))

export default router
