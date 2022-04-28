const path = require('path')
const webpack = require('webpack')
const rootPath = process.cwd()
const context = path.join(rootPath, 'src')
const outputPath = path.join(rootPath, 'dist')

module.exports = {
  mode: 'development',
  context,
  stats: {
    children: true
  },
  entry: {
    dicomMicroscopyViewer: './dicom-microscopy-viewer.js'
  },
  target: 'web',
  output: {
    library: {
      name: '[name]',
      type: 'umd',
      umdNamedDefine: true
    },
    globalObject: 'this',
    path: outputPath,
    publicPath: 'auto'
  },
  devtool: 'source-map',
  resolve: {
    fallback: {
      fs: false,
      path: false
    }
  },
  module: {
    noParse: [/(codec)/, /(dicomicc)/],
    rules: [
      {
        test: /\.css$/,
        use: 'css-loader'
      },
      {
        test: /\.wasm/,
        type: 'asset/resource'
      },
      {
        test: /\.worker\.js$/,
        use: [
          {
            loader: 'worker-loader'
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: [/(node_modules)/, /(codecs)/, /(dicomicc)/],
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [new webpack.ProgressPlugin()]
}
