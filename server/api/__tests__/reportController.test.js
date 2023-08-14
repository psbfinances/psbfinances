'use strict'

import { controller } from '../reportController.js'
import { initConfig } from '../../config/index.js'

/** calculateYearTaxes */
describe('calculateYearTaxes', () => {
  beforeAll(async () => {
    await initConfig()
  })
  it.skip('returns year taxes', async () => {
    const actual = await controller.calculateYearTaxes('ckkfm160400003e5iimcnpt4s', 'ckkfmwjgo00033e5i0z3hktbj', '2021')
    console.log(actual)
    expect(actual).toBeDefined()
  })
})
