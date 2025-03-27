const path = require("path")
const webpack = require("webpack")

const rootPath = process.cwd()
const context = path.join(rootPath, "src")
const outputPath = path.join(rootPath, "dist/esm")

module.exports = {
  mode: "development",
  context,
  stats: {
    children: true,
  },
  entry: {
    dicomMicroscopyViewer: "./dicom-microscopy-viewer.js",
  },
  target: "web",
  output: {
    path: outputPath,
    publicPath: "auto",
    filename: "[name].js",
    library: {
      type: "module",
    },
    module: true,
    environment: {
      module: true,
    },
  },
  experiments: {
    outputModule: true,
  },
  devtool: "source-map",
  resolve: {
    fallback: {
      fs: false,
      path: false,
    },
  },
  module: {
    // noParse: [/(codec)/, /(dicomicc)/],
    rules: [
      {
        test: /\.css$/,
        use: "css-loader",
      },
      {
        test: /\.wasm$/,
        type: "asset/resource",
      },
    ],
  },

  plugins: [new webpack.ProgressPlugin()],
}
