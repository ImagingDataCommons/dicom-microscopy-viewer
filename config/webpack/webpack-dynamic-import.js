const path = require('path')
const merge = require('./merge')
const rootPath = process.cwd()
const baseConfig = require('./webpack-base')
const TerserPlugin = require('terser-webpack-plugin')
const outputPath = path.join(rootPath, 'dist', 'dynamic-import', 'dicom-microscopy-viewer')

const prodConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  stats: {
    children: true
  },
  output: {
    path: outputPath,
    libraryTarget: 'umd',
    globalObject: 'window',
    filename: '[name].min.js',
    publicPath: '/dicom-microscopy-viewer/'
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        parallel: true
      })
    ]
  }
}

module.exports = merge(baseConfig, prodConfig)