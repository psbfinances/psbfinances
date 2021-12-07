'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'
import cuid from 'cuid'
import { getLogger } from '../core/index.js'
import { ImportRuleDb } from '../db/index.js'
import utils from './utils.js'
import DataChangeLogic, { ops } from './dataChangeLogic.js'
import DipRule from '../../shared/models/dipRule.js'

const logger = getLogger(import.meta.url)

const controller = {
  /**
   * Gets tenant import rules.
   * @param {import('express').Request} req
   * @param {DipRule} req.body
   * @param {import('express').Response} res
   * @return {Array<DipRule>}
   */
  list: async (req, res) => {
    const { tenantId, userId } = utils.getBasicRequestData(req)
    logger.info('list', {tenantId, userId})
    const db = new ImportRuleDb()
    const rows = await db.list(req.user.tenantId)
    rows.forEach(x => delete x.tenantId)
    res.json(rows)
  },

  /**
   * Saves new rule.
   * @param {AppRequest} req
   * @param {DipRule} req.body
   * @param {import('express').Response} res
   * @return {DipRule}
   */
  insert: async (req, res) => {
    const { tenantId, userId } = utils.getBasicRequestData(req)
    const ruleData = req.body
    logger.info('insert', {tenantId, userId, ruleData})

    ruleData.id = cuid()
    ruleData.tenantId = tenantId
    const data = DipRule.fromData(ruleData)
    const errors = data.validate()
    if (Object.keys(errors).length > 0) return res.json({ errors })

    const db = new ImportRuleDb()
    await db.insert(data)

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(db.tableName, ruleData.id, ops.INSERT, data)
    res.json(data)
  },

  /**
   * Updates existing rule.
   * @param {import('express').Request} req
   * @param {DipRule} req.body
   * @param {import('express').Response} res
   * @return {DipRule|Object}
   */
  update: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    const ruleData = req.body
    ruleData.tenantId = tenantId
    logger.info('update', {tenantId, userId, ruleData})

    let data = DipRule.fromData(ruleData)
    const errors = data.validate()
    if (Object.keys(errors).length > 0) return res.json({ errors })

    const dbData = data.toDb()
    const db = new ImportRuleDb()
    await db.update({id, tenantId, ...dbData})

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(db.tableName, id, ops.UPDATE, dbData)

    res.json(data)
  },

  /**
   * Deletes rule.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {void}
   */
  delete: async (req, res) => {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    logger.info('delete', {tenantId, userId, id})

    const db = new ImportRuleDb()
    const data = await db.get(id, tenantId)
    await db.delete({id, tenantId})

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(db.tableName, id, ops.DELETE, data)

    res.json({})
  }

}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/').get(asyncHandler(controller.list))
router.route('/').post(asyncHandler(controller.insert))
router.route('/:id').put(asyncHandler(controller.update))
router.route('/:id').delete(asyncHandler(controller.delete))

export default router
export { controller }
