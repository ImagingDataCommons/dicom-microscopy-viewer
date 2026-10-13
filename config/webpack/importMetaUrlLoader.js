/**
 * Replaces import.meta.url with the runtime script location. Webpack would
 * otherwise inline the absolute path of the module on the build machine
 * (file:///...) into the bundle. Emscripten loaders only use the value as a
 * default script directory, which locateFile overrides.
 */
module.exports = function importMetaUrlLoader(source) {
  return source.replace(/import\.meta\.url/g, 'self.location.href')
}
