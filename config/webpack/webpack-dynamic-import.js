const path = require('path')
const merge = require('./merge')
const rootPath = process.cwd()
const baseConfig = require('./webpack-base')
const TerserPlugin = require('terser-webpack-plugin')
const outputPath = path.join(rootPath, 'dist', 'dynamic-import')

const prodConfig = {
  mode: 'production',
  stats: {
    children: true
  },
  output: {
    path: outputPath,
    libraryTarget: 'umd',
    globalObject: 'this',
    filename: '[name].min.js'
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true
      })
    ]
  }
}

module.exports = merge(baseConfig, prodConfig)
