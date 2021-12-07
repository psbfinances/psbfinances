'use strict'

import { run, getFileList } from '../deployDb.js'

/** getFileList */
describe.skip('getFileList', () => {
  const dbDir = '../.db/'
  it('returns list of the files', async () => {
    const actual = await getFileList(dbDir)
    expect(actual.length).toBeGreaterThan(0)
  })
})

/** run */
describe.skip('run', () => {
  const dbDir = '../.db/'
  it('applies changes', async () => {
    await run(dbDir)
    expect(true).toBeTruthy()
  })
})
