'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'
import { BusinessDb } from '../db/index.js'
import utils from './utils.js'
import { businessModel } from '../../shared/models/index.js'
import cuid from 'cuid'
import DataChangeLogic, { ops } from './dataChangeLogic.js'

const controller = {
  /**
   * Gets tenant businesses.
   * @property {AppRequest} req
   * @property {e.Response} response
   * @return {Array<Business>}
   */
  list: async (req, res) => {
      const businessDb = new BusinessDb()
      const rows = await businessDb.list(req.user.tenantId)
      const result = rows.map(x => {
        const {id, nickname, fullName} = x
        return {id, nickname, fullName}
      }).sort((x, y) => (x.nickname > y.nickname ? 1 : -1))
      res.json(result)
  },

  /**
   * Saves a new business.
   * @property {AppRequest} req
   * @property {Business} req.body
   * @property {Response} response
   * @return {Business|Object}
   */
  insert: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)

    const business = req.body
    const errors = businessModel.validate(business)
    if (Object.keys(errors).length > 0) return res.json({ errors })

    business.id = cuid()
    business.tenantId = tenantId
    const businessDb = new BusinessDb()
    await businessDb.insert(business)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(businessDb.tableName, id, ops.INSERT, business)
    res.json(business)
  },

  /**
   * Updates existing business.
   * @property {AppRequest} req
   * @property {Business} req.body
   * @property {Response} response
   * @return {Car|Object}
   */
  update: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    /** @type {Business} */
    const business = req.body
    const errors = businessModel.validate(business)
    if (Object.keys(errors).length > 0) return res.json({ errors })

    const businessDb = new BusinessDb()
    await businessDb.update({ id, tenantId, ...business })

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(businessDb.tableName, id, ops.UPDATE, business)

    res.json({business })
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/').get(asyncHandler(controller.list))
router.route('/').post(asyncHandler(controller.insert))
router.route('/:id').put(asyncHandler(controller.update))

export default router
