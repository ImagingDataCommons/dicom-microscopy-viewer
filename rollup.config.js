import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss'

export default {
  input: 'src/dicom-microscopy-viewer.js',
  output: [
    {
      file: 'build/dicom-microscopy-viewer.js',
      format: 'umd',
      name: 'DICOMMicroscopyViewer',
      sourceMap: true
    },
  ],
  plugins: [
    builtins(),
    commonjs(),
    json(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    postcss({
      plugins: []
    })
  ],
  onwarn: function(warning, superOnWarn) {
    /*
     * skip certain warnings
     * https://github.com/openlayers/openlayers/issues/10245
     */
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    superOnWarn(warning);
  }
};
