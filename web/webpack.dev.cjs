'use strict'

const { merge } = require('webpack-merge')
const common = require('./webpack.common.cjs')
const { join } = require('path')

module.exports = merge(common, {
  mode: 'development',
  cache: true,
  devtool: 'source-map',
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: true
  },

  devServer: {
    static: {
      directory: join(__dirname, 'public'),
      publicPath: '/'
    },
    // magicHtml: true,
    historyApiFallback: true,
    hot: true,
    proxy: [
      {
        context: ['/api', '/api/files'],
        target: 'http://localhost:9000',
      },
    ],
    port: 9001
  }
})

// console.log([path.join(__dirname), path.join(__dirname, 'public')])
