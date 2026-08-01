const path = require('node:path')
const webpack = require('webpack')
const rootPath = process.cwd()
const context = path.join(rootPath, 'src')
const outputPath = path.join(rootPath, 'dist')

module.exports = {
  mode: 'development',
  context,
  stats: {
    children: true,
  },
  entry: {
    dicomMicroscopyViewer: './dicom-microscopy-viewer.js',
    'dataLoader.worker': './webWorker/dataLoader.worker.js',
  },
  target: 'web',
  output: {
    library: {
      name: '[name]',
      type: 'umd',
      umdNamedDefine: true,
    },
    globalObject: 'this',
    path: outputPath,
    publicPath: 'auto',
  },
  devtool: 'source-map',
  resolve: {
    fallback: {
      fs: false,
      path: false,
      url: false,
    },
  },
  module: {
    noParse: [/(codec)/, /(dicomicc)/],
    rules: [
      {
        test: /\.css$/,
        use: 'css-loader',
      },
      {
        test: /\.wasm/,
        type: 'asset/resource',
      },
      {
        test: /\.js$/,
        /**
         * Only transpile this package's own sources. Excluding on a bare
         * /(node_modules)/ pattern breaks when the package itself is built
         * from a directory whose path contains "node_modules" (e.g. pnpm
         * builds git-hosted dependencies inside its store), which silently
         * skips babel — and babel-plugin-transform-import-meta — for every
         * module, so webpack then fails to resolve
         * new URL('./dataLoader.worker.min.js', import.meta.url).
         */
        include: context,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [new webpack.ProgressPlugin()],
}
