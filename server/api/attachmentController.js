'use strict'

import express from 'express'
import utils from './utils.js'
import path, { dirname } from 'path'
import { getLogger } from '../core/index.js'
import { AttachmentDb } from '../db/index.js'
import { fileURLToPath } from 'url'

const logger = getLogger(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

const controller = {
  /**
   * Sends file in the response.
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  getFile: async (req, res) => {
    const { tenantId, userId } = utils.getBasicRequestData(req)
    const id = req.params[0]
    logger.info('getFile', {tenantId, userId, id})
    const attachmentDb = new AttachmentDb()
    const attachments = await attachmentDb.get(id, tenantId)
    const fileName = attachments[0].fileName
    const filePath = path.resolve(__dirname, `../../files/${fileName}`)
    res.sendFile(filePath)
  }
}

const router = express.Router()

export default router
export { controller }
