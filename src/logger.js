/**
 * Level-based logger for dicom-microscopy-viewer.
 * Host apps call {@link setLogLevel} once at startup; web workers receive the
 * same settings on initialize via {@link getLoggerOptions} and are re-notified
 * of later changes through listeners registered with
 * {@link onLoggerConfigChange}.
 */

export const LogLevel = {
  DEBUG: 0,
  LOG: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
}

/** @typedef {'DEBUG' | 'LOG' | 'WARN' | 'ERROR' | 'NONE'} LoggerLevelName */

/**
 * @typedef {object} LoggerOptions
 * @property {LoggerLevelName} [level]
 */

const DEFAULT_LOGGER_OPTIONS = {
  level: 'WARN',
}

/** @type {LoggerOptions} */
let activeLoggerOptions = { ...DEFAULT_LOGGER_OPTIONS }

/** @type {Array<(options: LoggerOptions) => void>} */
const changeListeners = []

/**
 * @param {string} level
 * @returns {number}
 */
export function parseLogLevel(level) {
  switch (String(level).toUpperCase()) {
    case 'DEBUG':
      return LogLevel.DEBUG
    case 'LOG':
      return LogLevel.LOG
    case 'WARN':
      return LogLevel.WARN
    case 'ERROR':
      return LogLevel.ERROR
    case 'NONE':
      return LogLevel.NONE
    default:
      return LogLevel.WARN
  }
}

/**
 * Register a callback invoked whenever the logger configuration changes,
 * e.g. so the web worker manager can forward new options to spawned workers.
 *
 * @param {(options: LoggerOptions) => void} listener
 * @returns {() => void} Unsubscribe function.
 */
export function onLoggerConfigChange(listener) {
  changeListeners.push(listener)
  return () => {
    const index = changeListeners.indexOf(listener)
    if (index !== -1) {
      changeListeners.splice(index, 1)
    }
  }
}

function syncLogger() {
  logger.configure(activeLoggerOptions)
  const snapshot = getLoggerOptions()
  for (const listener of changeListeners) {
    listener(snapshot)
  }
}

/**
 * Merge a partial configuration into the current active options.
 *
 * @param {LoggerOptions | null} [options] Pass `null` to reset defaults (tests).
 */
export function configureLogger(options) {
  activeLoggerOptions =
    options == null
      ? { ...DEFAULT_LOGGER_OPTIONS }
      : { ...activeLoggerOptions, ...options }
  syncLogger()
}

/**
 * Resolve logger overrides from viewer constructor options.
 *
 * Returns only the fields that should override the current configuration;
 * callers merge the result into the active options, so an empty object means
 * "leave the configuration unchanged".
 *
 * @param {object} [options]
 * @param {boolean} [options.debug]
 * @param {LoggerOptions} [options.logger]
 * @returns {LoggerOptions}
 */
export function resolveLoggerOptions(options = {}) {
  if (options.logger != null) {
    return { ...options.logger }
  }
  if (options.debug === true) {
    return { level: 'DEBUG' }
  }
  return {}
}

/**
 * Set library-wide logging (call once at host app startup).
 *
 * Both the string and the object form merge into the current configuration,
 * so partial updates never reset unrelated settings.
 *
 * @param {LoggerLevelName | LoggerOptions} levelOrOptions
 */
export function setLogLevel(levelOrOptions) {
  if (typeof levelOrOptions === 'string') {
    configureLogger({ level: levelOrOptions })
  } else {
    configureLogger({ ...levelOrOptions })
  }
}

/**
 * Apply viewer constructor logging overrides (`options.logger` or `options.debug`).
 *
 * @param {object} options
 */
export function applyViewerOptions(options = {}) {
  if (options.logger == null && options.debug !== true) {
    return
  }
  setLogLevel(resolveLoggerOptions(options))
}

/**
 * Serializable logger options for web worker initialize messages.
 *
 * @returns {LoggerOptions}
 */
export function getLoggerOptions() {
  return { ...activeLoggerOptions }
}

/**
 * Reset to defaults (tests).
 */
export function resetLoggerOptions() {
  configureLogger(null)
}

export class Logger {
  constructor() {
    this.configure(activeLoggerOptions)
  }

  /**
   * Resolve and cache the numeric level so {@link shouldLog} stays cheap on
   * hot per-tile paths. Called whenever the global configuration changes.
   *
   * @param {LoggerOptions} options
   */
  configure(options) {
    this._level = parseLogLevel(options?.level ?? 'WARN')
  }

  /** @param {number} level */
  shouldLog(level) {
    return level >= this._level
  }

  /** Verbose diagnostics (Chrome DevTools “Verbose” / console.debug). */
  debug(...args) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(...args)
    }
  }

  log(...args) {
    if (this.shouldLog(LogLevel.LOG)) {
      console.log(...args)
    }
  }

  warn(...args) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(...args)
    }
  }

  error(...args) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(...args)
    }
  }
}

export const logger = new Logger()
