/**
 * Loading of the lazily split bulk annotation modules (deck.gl and the
 * layers built on it).
 */

import { getMicroscopyHref } from '../webWorker/webWorkerManager.js'

/**
 * Whether an error is webpack's failure to fetch an async chunk.
 *
 * @param {*} error
 * @returns {boolean}
 * @private
 */
function isChunkLoadError(error) {
  return error?.name === 'ChunkLoadError'
}

/**
 * Webpack's runtime public path, or `undefined` outside a webpack build.
 *
 * @returns {string|undefined}
 * @private
 */
function currentPublicPath() {
  /** Only defined when this code runs from a webpack build of DMV */
  if (typeof __webpack_public_path__ === 'undefined') {
    return undefined
  }
  return __webpack_public_path__
}

/**
 * Point webpack's async chunk loading at the folder DMV's web worker and
 * codecs are served from.
 *
 * @param {string} href
 * @private
 */
function setPublicPath(href) {
  __webpack_public_path__ = href
}

/**
 * Import a lazily split module.
 *
 * DMV's builds use `publicPath: 'auto'`: async chunks are fetched next to
 * the script that loaded DMV. An application that bundles DMV again (Vite's
 * dependency pre-bundling in Slim, or any production bundler) runs DMV from
 * its own script, so the chunks are requested from the application's folder
 * and fail to load. On that failure the chunks are looked for once more
 * where DMV's worker and codecs are served from (`getMicroscopyHref`, by
 * default `<PUBLIC_URL>/static/js/`, where applications copy DMV's
 * `dist/dynamic-import` files).
 *
 * @param {function(): Promise<*>} load - Calls `import()`
 * @returns {Promise<*>} The module
 */
export async function importLazyChunk(load) {
  /** The path this load used: another load may change it meanwhile */
  const publicPath = currentPublicPath()
  try {
    return await load()
  } catch (error) {
    if (!isChunkLoadError(error) || publicPath === undefined) {
      throw error
    }
    const href = getMicroscopyHref()
    if (publicPath === href) {
      /** Already loaded from the library path: nowhere else to look */
      throw error
    }
    if (currentPublicPath() !== href) {
      console.warn(
        '[bulkAnnotations] could not load a deck.gl chunk next to the DMV ' +
          `script; loading it from "${href}"`,
      )
      setPublicPath(href)
    }
    return load()
  }
}
