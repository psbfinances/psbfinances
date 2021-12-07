'use strict'

import { initConfig } from '../../config/index.js'
import { controller } from '../tenantController.js'

beforeAll(async () => {
  await initConfig()
})

/** create */
describe.skip('create', () => {
  it('inserts tenant', async () => {
    const actual = await controller.create('joe@doe.com', 'jdPassword')
    console.log(actual)
    expect(actual).toBeDefined()
  })
})
