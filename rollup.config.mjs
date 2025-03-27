import babel from "@rollup/plugin-babel"
import resolve from "@rollup/plugin-node-resolve"
import json from "@rollup/plugin-json"
import postcss from "rollup-plugin-postcss"
import commonjs from "@rollup/plugin-commonjs"

import { readFileSync } from "fs"

const pkg = JSON.parse(readFileSync("package.json", { encoding: "utf8" }))

export default [
  {
    external: [
      "dcmjs",
      "gl-matrix",
      "ndarray",
      /@babel\/runtime/,
      /\.wasm$/, // Mark all .wasm files as external
    ],
    input: {
      "dicom-microscopy-viewer": pkg.src || "src/dicom-microscopy-viewer.js",
      "webWorker/decodeAndTransformTask":
        "src/webWorker/decodeAndTransformTask.js",
      "webWorker/webWorkerManager": "src/webWorker/webWorkerManager.js",
    },
    output: [
      {
        dir: "dist/esm",
        format: "es",
        sourcemap: false,
        preserveModules: true,
        preserveModulesRoot: "src",
        exports: "named",
      },
    ],
    plugins: [
      commonjs(),
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      postcss({
        extensions: [".css"],
        minimize: true,
        inject: false,
        extract: false,
      }),
      babel({
        exclude: "node_modules/**",
        babelHelpers: "runtime",
        extensions: [".js", ".ts"],
      }),
      json(),
    ],
  },
]
