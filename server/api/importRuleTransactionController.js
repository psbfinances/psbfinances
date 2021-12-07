'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'
import { getLogger } from '../core/index.js'
import { ImportRuleTransactionDb } from '../db/index.js'

const logger = getLogger(import.meta.url)

const controller = {
  /**
   * Saves new rule.
   * @param {AppRequest} req
   * @param {psbf.ImportRuleTransaction} req.body
   * @param {import('express').Response} res
   * @return {psbf.ImportRuleTransaction}
   */
  insert: async (req, res) => {
    const { tenantId, userId } = utils.getBasicRequestData(req)
    const data = req.body
    logger.info('insert', {tenantId, userId, data})

    data.tenantId = tenantId

    const db = new ImportRuleTransactionDb()
    await db.insert(data)

    res.json(data)
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/').post(asyncHandler(controller.insert))

export default router
export { controller }
