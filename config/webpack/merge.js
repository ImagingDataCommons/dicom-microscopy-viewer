const _ = require('lodash')

// Merge two objects
// Instead of merging array objects index by index (n-th source
// item with n-th object item) it concatenates both arrays
module.exports = (object, source) => {
  const clone = _.cloneDeep(object)
  const merged = _.mergeWith(
    clone,
    source,
    (objValue, srcValue, _key, _object, _source, _stack) => {
      if (objValue && srcValue && _.isArray(objValue) && _.isArray(srcValue)) {
        return _.concat(objValue, srcValue)
      }
    },
  )

  return merged
}
