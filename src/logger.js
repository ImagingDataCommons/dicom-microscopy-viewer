/**
 * Level-based logger for dicom-microscopy-viewer.
 * Host apps call {@link setLogLevel} once at startup; web workers receive the
 * same settings on initialize via {@link getLoggerOptions}.
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
 * @property {boolean} [enableInProduction]
 * @property {boolean} [enableInDevelopment]
 */

/**
 * @typedef {object} ResolvedLoggerConfig
 * @property {number} level
 * @property {boolean} enableInProduction
 * @property {boolean} enableInDevelopment
 */

const DEFAULT_LOGGER_OPTIONS = {
  level: 'WARN',
  enableInProduction: false,
  enableInDevelopment: true,
}

/** @type {LoggerOptions} */
let activeLoggerOptions = { ...DEFAULT_LOGGER_OPTIONS }

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
 * @param {LoggerOptions} options
 * @returns {ResolvedLoggerConfig}
 */
function resolveConfig(options) {
  return {
    level: parseLogLevel(options.level ?? 'WARN'),
    enableInProduction: Boolean(options.enableInProduction),
    enableInDevelopment: options.enableInDevelopment !== false,
  }
}

function getActiveConfig() {
  return resolveConfig(activeLoggerOptions)
}

function syncLogger() {
  logger.configure(getActiveConfig())
}

/**
 * @param {LoggerOptions | null} [options] Pass `null` to reset defaults (tests).
 */
export function configureLogger(options) {
  activeLoggerOptions =
    options == null
      ? { ...DEFAULT_LOGGER_OPTIONS }
      : { ...DEFAULT_LOGGER_OPTIONS, ...options }
  syncLogger()
}

/**
 * Resolve logger settings from viewer constructor options.
 *
 * @param {object} [options]
 * @param {boolean} [options.debug]
 * @param {LoggerOptions} [options.logger]
 * @returns {LoggerOptions}
 */
export function resolveLoggerOptions(options = {}) {
  if (options.logger != null) {
    return {
      ...DEFAULT_LOGGER_OPTIONS,
      ...options.logger,
    }
  }
  if (options.debug === true) {
    return {
      ...DEFAULT_LOGGER_OPTIONS,
      level: 'DEBUG',
    }
  }
  return { ...DEFAULT_LOGGER_OPTIONS }
}

/**
 * Set library-wide logging (call once at host app startup).
 *
 * @param {LoggerLevelName | LoggerOptions} levelOrOptions
 */
export function setLogLevel(levelOrOptions) {
  if (typeof levelOrOptions === 'string') {
    activeLoggerOptions = {
      ...activeLoggerOptions,
      level: levelOrOptions,
    }
  } else {
    activeLoggerOptions = {
      ...DEFAULT_LOGGER_OPTIONS,
      ...levelOrOptions,
    }
  }
  syncLogger()
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
    this.config = getActiveConfig()
  }

  /** @param {ResolvedLoggerConfig} config */
  configure(config) {
    this.config = config
  }

  /** @param {number} level */
  shouldLog(level) {
    const config = getActiveConfig()
    if (level < config.level) {
      return false
    }
    const nodeEnv =
      typeof process !== 'undefined' && process.env?.NODE_ENV != null
        ? process.env.NODE_ENV
        : 'development'
    if (nodeEnv === 'production') {
      return config.enableInProduction
    }
    return config.enableInDevelopment
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
