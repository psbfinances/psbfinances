'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'

import { TripDb, TransactionDb } from '../db/index.js'
import DataChangeLogic, { ops } from './dataChangeLogic.js'
import utils from './utils.js'

const controller = {
  /**
   * Get tenant trip
   * @property {AppRequest} req
   * @property {e.Response} response
   * @return {Trip}
   */
  get: async (req, res) => {
    const db = new TripDb()
    let rows = await db.get(req.params.id, req.user.tenantId)
    rows.forEach(x => (delete x.tenantId))
    res.json(rows.length > 0 ? rows[0] : {})
  },

  /**
   * Gets tenant trips
   * @property {AppRequest} req
   * @property {e.Response} response
   * @return {Array<Trip>}
   */
  list: async (req, res) => {
    const db = new TripDb()
    let rows = await db.list(req.user.tenantId)
    rows.forEach(x => (delete x.tenantId))
    res.json(rows)
  },

  /**
   * Inserts trip.
   * @param {AppRequest} req
   * @param {Trip} req.body
   * @param {e.Response} res
   * @return {Promise<Trip>}
   */
  insert: async (req, res) => {
    const tenantId = req.user.tenantId
    const userId = req.user.id
    const trip = { ...req.body, tenantId }
    trip.startDate = new Date(trip.startDate)
    trip.endDate = new Date(trip.endDate)
    // TODO data validation

    const tripDb = new TripDb()
    await tripDb.insert(trip)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(tripDb.tableName, trip.id, ops.INSERT, trip)

    res.json(trip)
  },

  /**
   * Updates trip.
   * @param {AppRequest} req
   * @param {Object} req.params
   * @param {string} req.params.id
   * @param {Trip} req.body
   * @param {e.Response} res
   * @return {Promise<Trip>}
   */
  update: async (req, res) => {
    const tenantId = req.user.tenantId
    const userId = req.user.id
    const id = req.params.id

    /** @type {Trip} */
    const trip = { ...req.body, tenantId }
    trip.startDate = new Date(trip.startDate)
    trip.endDate = new Date(trip.endDate)
    // TODO data validation

    const { startDate, endDate, distance, description } = trip
    const tripChanges = { startDate, endDate, distance, description }
    const tripDb = new TripDb()
    await tripDb.update({ id, tenantId, ...tripChanges })

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(tripDb.tableName, trip.id, ops.UPDATE, tripChanges)

    res.json(trip)
  },

  /**
   * Deletes tenant trip
   * @property {AppRequest} req
   * @property {e.Response} response
   * @return {void}
   */
  delete: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)

    const tripDb = new TripDb()
    let rows = await tripDb.get(id, tenantId)
    if (rows.length === 0) return res.status(404).json({ error: 'Cannot find trip' })

    const transactionDb = new TransactionDb()
    const transactionId = rows[0].transactionId
    let transactionChange = {tripId: null}
    await transactionDb.update({ id: transactionId, tenantId, ...transactionChange})

    await tripDb.delete({id, tenantId})

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(transactionDb.tableName, transactionId, ops.UPDATE, { oldTripId: id, tripId: null })
    await dataChangeLogic.insert(tripDb.tableName, id, ops.DELETE, {transactionId})

    res.json({})
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/:id').get(asyncHandler(controller.get))
router.route('/:id').delete(asyncHandler(controller.delete))
router.route('/').get(asyncHandler(controller.list))
router.route('/').post(asyncHandler(controller.insert))
router.route('/:id').patch(asyncHandler(controller.update))

export default router
export {
  controller
}
