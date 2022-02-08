const path = require('path')

const config = {
  entry: path.resolve(__dirname, 'src/dicom-microscopy-viewer.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'dicom-microscopy-viewer.js',
    library: {
      name: 'DICOMMicroscopyViewer',
      type: 'umd',
      umdNamedDefine: true
    }
  },
  module: {
    noParse: [/(codecs)/],
    rules: [
      {
        test: /\.css$/,
        use: 'css-loader'
      },
      {
        test: /\.wasm$/,
        type: 'asset/inline',
      },
    ]
  },
  experiments: {
    asyncWebAssembly: true,
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
