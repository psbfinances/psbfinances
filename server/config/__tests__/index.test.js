'use strict'

import { initConfig, config } from '../index.js'

/**
 * initConfig
 */
describe('initConfig', () => {
  it('returns dev config', async () => {
    await initConfig('config._dev.yaml')

    const actual = config
    expect(actual).toBeDefined()
    expect(actual.port).toBe(9000)
    expect(actual.logLevel).toBeDefined()
  })
})
