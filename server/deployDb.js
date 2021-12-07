'use strict'

import fs from 'fs'
import path from 'path'
import { initConfig } from './config/index.js'
import { getLogger } from './core/index.js'
import { Db, DbChangeDb } from './db/index.js'
import { statements as dbChangesDDL } from '../.db/dbChanges.js'

const logger = getLogger(import.meta.url)

const dbDir = '../.db/'
const tenantId = -1

export const getFileList = async (dir = dbDir) => fs.promises.readdir(dir)

export const run = async (dir = dbDir) => {
  logger.info('run', { step: 'start', dir })
  await initConfig()

  const db = new Db('')
  await db.rawDDL(dbChangesDDL[0], {})
  const dbChangeDb = new DbChangeDb()

  let dbChanges = await dbChangeDb.list(tenantId)
  dbChanges = dbChanges.map(x => x.id)

  let dbChangeFiles = await getFileList(dir)
  dbChangeFiles = dbChangeFiles.filter(x => x.includes('.js') && x !== 'dbChanges.js')
  const allFilesCount = dbChangeFiles.length
  dbChangeFiles = dbChangeFiles.filter(x => !dbChanges.includes(x))
  const newFilesCount = dbChangeFiles.length

  logger.debug('run', { step: 'getFileList', allFilesCount, newFilesCount})
  if (newFilesCount === 0) {
    logger.info('run', { step: 'completed', dir, newFilesCount })
    return
  }

  for (let file of dbChangeFiles) {
    const absolutePath = path.resolve(dbDir, file)
    logger.debug('run', { step: 'processFile', absolutePath })
    const { statements } = await import(absolutePath)
    await dbChangeDb.insert({id: file, startAt: new Date()})
    for (const statement of statements) {
      await db.rawDDL(statement, {})
    }
    await dbChangeDb.update({id: file, tenantId, endAt: new Date(), statementCount: newFilesCount})
  }
  logger.info('run', { step: 'completed', dir, newFilesCount })
}

