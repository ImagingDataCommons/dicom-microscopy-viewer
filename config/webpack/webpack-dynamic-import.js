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
    /**
     * Webpack's default vendor cache group splits a node_modules module out
     * of its chunk into a shared "vendor" chunk whenever it's reachable from
     * 2+ chunk groups — but for these dynamic-import() chunks (each loaded
     * standalone, not through a page that also loads the vendor chunk),
     * that produced a broken build: @deck.gl/layers/solid-polygon-layer's
     * own submodules (polygon.js, polygon-tesselator.js) got pulled into a
     * vendors-*deck_gl_extensions* chunk (shared with DataFilterExtension),
     * but the solid-polygon-layer.js barrel itself stayed behind in
     * bulkAnnotations_layers_index_js.worker.min.js as a bare `require()`
     * with no matching module — "Cannot find module" at runtime, since
     * that vendor chunk is never loaded alongside this one. Disabling the
     * default cache groups keeps every async chunk self-contained.
     */
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        default: false,
        defaultVendors: false,
      },
    },
  },
  experiments: {
    asyncWebAssembly: true,
  },
}

module.exports = merge(baseConfig, prodConfig)
