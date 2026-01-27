const path = require('node:path')
const merge = require('./merge')
const rootPath = process.cwd()
const baseConfig = require('./webpack-base')
const TerserPlugin = require('terser-webpack-plugin')
const outputPath = path.join(rootPath, 'dist', 'dynamic-import')

/** Override the WASM rule from base config to use a specific public path to avoid conflicts */
const wasmRule = {
  test: /\.wasm/,
  type: 'asset/resource',
  generator: {
    filename: '[name][ext]',
  },
}

const prodConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  stats: {
    children: true,
  },
  output: {
    path: outputPath,
    libraryTarget: 'umd',
    globalObject: 'self',
    filename: '[name].min.js',
    publicPath: 'auto',
    chunkFilename: '[name].worker.min.js',
  },
  module: {
    rules: [wasmRule],
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },
  experiments: {
    asyncWebAssembly: true,
  },
}

module.exports = merge(baseConfig, prodConfig)
