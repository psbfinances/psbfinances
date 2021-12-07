'use strict'

import fs from 'fs'
import path from 'path'
import YAML from 'yamljs'
import { fileURLToPath } from 'url'
import { getLogger, c } from '../core/index.js'

const logger = getLogger(import.meta.url)
const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {PlatformConfig} */
export let config
let initialized = false

/**
 * Initializes config.
 */
export const initConfig = async localFileName => {
  if (initialized) return //Promise.resolve()

  const env = process.env.NODE_ENV || c.environments.DEV
  logger.info('initConfig', { env, configBucket: process.env.AWS_S3_CONFIG_BUCKET })

  const localConfigFileName = path.join(dirname, localFileName || `config.${env}.yaml`)
  const data = fs.readFileSync(localConfigFileName)
  const configYaml = data.toString()
  config = YAML.parse(configYaml)

  config.rootFolder = path.resolve(dirname, '../')
  config.inboxFolder = `${config.rootFolder}/data/inbox/`
  config.archiveFolder = `${config.rootFolder}/data/archive/`

  logger.info('initConfig', { initialized: true })
  config.port = process.env.PORT || 9000
  initialized = true
}
