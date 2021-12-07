'use strict'

import fs from 'fs'
import path from 'path'
import { getLogger } from './core/index.js'

const logger = getLogger(import.meta.url)
const rootFolder = './'

const initApp = {
  /**
   * Creates a folder.
   * @param {string} folder
   */
  createFolder: folder => {
    const folderPath = path.resolve(rootFolder, folder)
    const folderExists = fs.existsSync(folderPath)
    logger.info('createFolder', { folder, folderPath, folderExists })
    if (!folderExists) fs.mkdirSync(folderPath)
  },

  /**
   * Creates initial application folders for various data files.
   * @description this code will create any missing folders only first time the app starts.
   */
  createFolders: () => {
    logger.info('createFolders', {env: process.env.NODE_ENV, rootFolder, })
    initApp.createFolder('../files')
    initApp.createFolder('../files/deleted')
    initApp.createFolder('data')
    initApp.createFolder('data/inbox')
    initApp.createFolder('data/archive')
  }
}

export default initApp
