import builtins from 'rollup-plugin-node-builtins';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
  input: 'src/dicom-microscopy-viewer.js',
  output: [
    {
      file: 'build/dicom-microscopy-viewer.js',
      format: 'umd',
      name: 'MicroscopyViewer',
      sourceMap: true
    },
  ],
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    builtins(),
    json()
  ]
};
