'use strict'

import JSONStream from 'JSONStream'
import es from 'event-stream'
import fs from 'fs'

const run = async fileName => {
  console.log(fileName)
  fs.createReadStream(fileName, {encoding: 'utf8'}).pipe(JSONStream.parse(['transactions', true])).pipe(es.mapSync(data => {
    console.log(data)
    return data
  }))
}

run('psb-finance/historyData/se-transactions-all.json')
