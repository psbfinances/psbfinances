'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'

import { CarDb } from '../db/index.js'
import utils from './utils.js'
import { carModel } from '../../shared/models/index.js'
import cuid from 'cuid'
import DataChangeLogic, { ops } from './dataChangeLogic.js'

const controller = {
  /**
   * Gets tenant cars
   * @property {AppRequest} req
   * @property {e.Response} response
   * @return {Array<Car>}
   */
  list: async (req, res) => {
      const db = new CarDb()
      let rows = await db.list(req.user.tenantId)
      rows.forEach(x => (delete x.tenantId))
      res.json(rows)
  },

  /**
   * Saves a new car.
   * @property {AppRequest} req
   * @property {Business} req.body
   * @property {Response} response
   * @return {Car|Object}
   */
  insert: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)

    const car = req.body
    const errors = carModel.validate(car)
    if (Object.keys(errors).length > 0) return res.json({ errors })

    car.id = cuid()
    car.tenantId = tenantId
    const db = new CarDb()
    await db.insert(car)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(db.tableName, id, ops.INSERT, car)
    res.json(car)
  },

  /**
   * Updates existing data.
   * @property {AppRequest} req
   * @property {Business} req.body
   * @property {Response} response
   * @return {Car|Object}
   */
  update: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    /** @type {Car} */
    const data = req.body
    const errors = carModel.validate(data)
    if (Object.keys(errors).length > 0) return res.json({ errors })

    const db = new CarDb()
    await db.update({ id, tenantId, ...data })

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(db.tableName, id, ops.UPDATE, data)

    res.json({data })
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/').get(asyncHandler(controller.list))
router.route('/').post(asyncHandler(controller.insert))
router.route('/:id').put(asyncHandler(controller.update))

export default router
