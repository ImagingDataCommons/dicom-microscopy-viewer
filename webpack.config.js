const path = require('path')

const config = {
  entry: path.resolve(__dirname, 'src/dicom-microscopy-viewer.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'dicom-microscopy-viewer.js',
    library: {
      name: 'DICOMMicroscopyViewer',
      type: 'umd',
      umdNamedDefine: true
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
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  experiments: {
    asyncWebAssembly: true
  },
  target: 'web',
  resolve: {
    fallback: {
      fs: false,
      path: false
    },
    extensions: ['.js', '.wasm']
  }
}

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'source-map'
    config.watch = true
  }
  return config
}
