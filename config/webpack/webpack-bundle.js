const path = require('path')
const webpack = require('webpack')
const rootPath = process.cwd()
const context = path.join(rootPath, 'src')
const outputPath = path.join(rootPath, 'dist')
const TerserPlugin = require('terser-webpack-plugin')

// The big difference between this and the dynamic-import version is that
// the dynamic import version does not bundle the WASM modules into the WebWorker file
module.exports = {
  mode: 'production',
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
      name: 'dicomMicroscopyViewer',
      type: 'umd',
      umdNamedDefine: true,
    },
    globalObject: 'this',
    path: outputPath,
    publicPath: 'auto',
    filename: '[name].bundle.min.js',
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
        type: 'asset/inline',
      },
      {
        test: /\.js$/,
        exclude: [/(node_modules)/, /(codecs)/, /(dicomicc)/],
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [new webpack.ProgressPlugin()],
  experiments: {
    asyncWebAssembly: true,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },
};
