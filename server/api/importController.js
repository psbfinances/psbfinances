'use strict'

import express from 'express'
import asyncHandler from 'express-async-handler'
import cuid from 'cuid'
import utils from './utils.js'
import { config } from '../config/index.js'
import path from 'path'
import { getLogger } from '../core/index.js'
import { Importer, importStep, enrich } from '../dip/importData.js'
import fs from 'fs'
import { ImportDb } from '../db/index.js'
import DataChangeLogic, {ops} from './dataChangeLogic.js'

const logger = getLogger(import.meta.url)

const controller = {
  /**
   * Gets tenant imports.
   * @property {AppRequest} req
   * @property {e.Response} response
   * @return {Array<Category>}
   */
  list: async (req, res) => {
    const db = new ImportDb()
    const rows = await db.list(req.user.tenantId)
    rows.forEach(x => (delete x.tenantId))
    res.json(rows)
  },

  /**
   * Processes new data import request.
   * @param {AppRequest} req
   * @param {Object} req.files
   * @param {Object} req.files.importFile
   * @param {e.Response} res
   * @return {Promise<Trip>}
   */
  insert: async (req, res) => {
    const id = cuid()
    const { tenantId, userId } = utils.getBasicRequestData(req)
    logger.info('insert', {id, tenantId, userId})
    if (!req.files || Object.keys(req.files).length === 0) {
      logger.info('insert', {id, tenantId, userId, error: 'missing import file'})
      throw new Error('No files were uploaded.')
    }

    const importFile = req.files.importFile
    const { formatId, accountId } = req.body
    const internalName = `${tenantId}-${id}-${formatId}.csv`
    /** @type {ImportFileInfo} */
    const dataFile = {
      id,
      originalName: importFile.name,
      size: importFile.size,
      internalName,
      filePath: path.join(config.inboxFolder, internalName),
      archiveFilePath: path.join(config.archiveFolder, internalName)
    }
    logger.info('insert', {id, tenantId, userId, formatId, dataFile})

    try {
      await importFile.mv(dataFile.filePath)
      res.json({ importId: id })

      try {
        const canSave = true
        const fileFullName = dataFile.filePath.replace('.csv', '-enr.csv')
        const Adapter = await Importer.getAdapter(formatId)
        const importAccountId = accountId || 'all'

        const fileImporter = new Adapter(tenantId, fileFullName, formatId, importAccountId, canSave)
        fileImporter.initDb()
        await fileImporter.logStep(importStep.ENRICH)
        enrich(dataFile.filePath)

        await fileImporter.run()

        await controller.insertCleanupInbox(fileImporter, dataFile, fileFullName)
        await fileImporter.logStep(importStep.DONE)
      } catch (e) {
        logger.error('insert-import', {id, error: e.message, stack: e.stack })
      }
    } catch (e) {
      logger.error('insert', {id, error: e.message, stack: e })
      res.status(500).send(e)
    }
  },

  /**
   *
   * @param {Object} fileImporter
   * @param {function} fileImporter.logStep
   * @param {ImportFileInfo} dataFile
   * @param {string} enrichedFileName
   * @return {Promise<void>}
   */
  async insertCleanupInbox (fileImporter, dataFile, enrichedFileName) {
    await fileImporter.logStep(importStep.ARCHIVE_FILE)
    await fs.promises.rename(dataFile.filePath, dataFile.archiveFilePath)
    await fileImporter.logStep(importStep.DELETE_ENRICHED_FILE)
    await fs.promises.rm(enrichedFileName)
  },

  async delete (req, res) {
    const { tenantId, userId, id } = utils.getBasicRequestData(req)
    logger.info('delete', {id, tenantId, userId})
    const result = await controller.processDelete(id, tenantId, userId)
    res.json(result)
  },

  async processDelete (id, tenantId, userId) {
    const importDb = new ImportDb()
    const rows = await importDb.get(id, tenantId)
    if (rows.length === 0) return {}

    await importDb.delete({ id, tenantId, processId: rows[0].processId })

    const dataChangeLogic = new DataChangeLogic(tenantId, userId)
    await dataChangeLogic.insert(importDb.tableName, id, ops.DELETE, {...rows[0]})
    return {}
  }
}

/** @type {import('express').Router} */
const router = express.Router()
router.route('/').get(asyncHandler(controller.list))
router.route('/').post(asyncHandler(controller.insert))
router.route('/:id').delete(asyncHandler(controller.delete))

export default router
export { controller }

/**
 * @typedef {Object} ImportFileInfo
 * @property {string} id
 * @property {string} originalName
 * @property {number} size
 * @property {string} internalName
 * @property {string} filePath
 * @property {string} archiveFilePath
 */
