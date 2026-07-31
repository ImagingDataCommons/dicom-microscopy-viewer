import {
  Logger,
  LogLevel,
  applyViewerOptions,
  configureLogger,
  getLoggerOptions,
  logger,
  onLoggerConfigChange,
  parseLogLevel,
  resetLoggerOptions,
  resolveLoggerOptions,
  setLogLevel,
} from './logger.js'

describe('Logger', () => {
  afterEach(() => {
    resetLoggerOptions()
  })

  it('uses quiet defaults when not configured', () => {
    resetLoggerOptions()
    expect(getLoggerOptions().level).toBe('WARN')
    const testLogger = new Logger()
    expect(testLogger.shouldLog(LogLevel.WARN)).toBe(true)
    expect(testLogger.shouldLog(LogLevel.ERROR)).toBe(true)
    expect(testLogger.shouldLog(LogLevel.LOG)).toBe(false)
    expect(testLogger.shouldLog(LogLevel.DEBUG)).toBe(false)
  })

  it('reads explicit configureLogger input', () => {
    configureLogger({ level: 'ERROR' })
    expect(getLoggerOptions().level).toBe('ERROR')
    expect(logger.shouldLog(LogLevel.ERROR)).toBe(true)
    expect(logger.shouldLog(LogLevel.WARN)).toBe(false)
  })

  it('parses log levels correctly', () => {
    expect(parseLogLevel('DEBUG')).toBe(LogLevel.DEBUG)
    expect(parseLogLevel('LOG')).toBe(LogLevel.LOG)
    expect(parseLogLevel('WARN')).toBe(LogLevel.WARN)
    expect(parseLogLevel('ERROR')).toBe(LogLevel.ERROR)
    expect(parseLogLevel('NONE')).toBe(LogLevel.NONE)
    expect(parseLogLevel('INVALID')).toBe(LogLevel.WARN)
  })

  it('singleton reflects setLogLevel after module load', () => {
    setLogLevel('DEBUG')
    expect(logger.shouldLog(LogLevel.DEBUG)).toBe(true)
    setLogLevel('ERROR')
    expect(logger.shouldLog(LogLevel.DEBUG)).toBe(false)
  })

  it('applies configuration regardless of NODE_ENV', () => {
    const previousNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      // warn/error must never be silenced by the environment
      expect(logger.shouldLog(LogLevel.WARN)).toBe(true)
      expect(logger.shouldLog(LogLevel.ERROR)).toBe(true)
      // explicit setLogLevel always wins
      setLogLevel('DEBUG')
      expect(logger.shouldLog(LogLevel.DEBUG)).toBe(true)
    } finally {
      process.env.NODE_ENV = previousNodeEnv
    }
  })

  it('caches the resolved level and updates it on configuration change', () => {
    setLogLevel('NONE')
    expect(logger.shouldLog(LogLevel.ERROR)).toBe(false)
    setLogLevel('DEBUG')
    expect(logger.shouldLog(LogLevel.DEBUG)).toBe(true)
  })
})

describe('setLogLevel / applyViewerOptions', () => {
  afterEach(() => {
    resetLoggerOptions()
  })

  it('maps debug:true to DEBUG logger level', () => {
    expect(resolveLoggerOptions({ debug: true }).level).toBe('DEBUG')
  })

  it('prefers explicit logger options over debug flag', () => {
    expect(
      resolveLoggerOptions({
        debug: true,
        logger: { level: 'ERROR' },
      }).level,
    ).toBe('ERROR')
  })

  it('applyViewerOptions updates worker-serializable config', () => {
    applyViewerOptions({
      logger: { level: 'DEBUG' },
    })
    expect(getLoggerOptions().level).toBe('DEBUG')
    expect(logger.shouldLog(LogLevel.DEBUG)).toBe(true)
  })

  it('setLogLevel updates global config without viewer construction', () => {
    setLogLevel('DEBUG')
    expect(getLoggerOptions().level).toBe('DEBUG')
    expect(logger.shouldLog(LogLevel.DEBUG)).toBe(true)
  })

  it('applyViewerOptions does not reset level set by setLogLevel', () => {
    setLogLevel('DEBUG')
    applyViewerOptions({ debug: false })
    expect(getLoggerOptions().level).toBe('DEBUG')
  })

  it('object-form setLogLevel merges over current options', () => {
    setLogLevel('ERROR')
    setLogLevel({})
    expect(getLoggerOptions().level).toBe('ERROR')
  })

  it('strips unknown fields so worker broadcasts stay serializable', () => {
    configureLogger({
      level: 'ERROR',
      custom: 'value',
      formatter: () => {},
    })
    expect(getLoggerOptions()).toEqual({ level: 'ERROR' })
    setLogLevel('DEBUG')
    expect(getLoggerOptions()).toEqual({ level: 'DEBUG' })
  })

  it('isolates setLogLevel from throwing config-change listeners', () => {
    const unsubscribe = onLoggerConfigChange(() => {
      throw new Error('listener boom')
    })
    try {
      expect(() => setLogLevel('DEBUG')).not.toThrow()
      expect(getLoggerOptions().level).toBe('DEBUG')
      expect(logger.shouldLog(LogLevel.DEBUG)).toBe(true)
    } finally {
      unsubscribe()
    }
  })

  it('viewer debug normalization only enables DEBUG for literal true', () => {
    // Mirrors option normalization in the VolumeImageViewer constructor
    const normalizeAndApply = (options) => {
      options.debug = options.debug === true
      applyViewerOptions(options)
      return options
    }

    expect(normalizeAndApply({ debug: false }).debug).toBe(false)
    expect(getLoggerOptions().level).toBe('WARN')
    expect(logger.shouldLog(LogLevel.DEBUG)).toBe(false)

    // truthy but non-boolean values must not enable debug either
    expect(normalizeAndApply({ debug: 1 }).debug).toBe(false)
    expect(getLoggerOptions().level).toBe('WARN')

    expect(normalizeAndApply({ debug: true }).debug).toBe(true)
    expect(getLoggerOptions().level).toBe('DEBUG')
  })
})

describe('onLoggerConfigChange', () => {
  afterEach(() => {
    resetLoggerOptions()
  })

  it('notifies listeners on every configuration change', () => {
    const seen = []
    const unsubscribe = onLoggerConfigChange((options) => {
      seen.push(options)
    })
    try {
      setLogLevel('DEBUG')
      expect(seen).toHaveLength(1)
      expect(seen[0].level).toBe('DEBUG')

      applyViewerOptions({ logger: { level: 'ERROR' } })
      expect(seen).toHaveLength(2)
      expect(seen[1].level).toBe('ERROR')
    } finally {
      unsubscribe()
    }
  })

  it('stops notifying after unsubscribe', () => {
    const seen = []
    const unsubscribe = onLoggerConfigChange((options) => {
      seen.push(options)
    })
    setLogLevel('DEBUG')
    unsubscribe()
    setLogLevel('ERROR')
    expect(seen).toHaveLength(1)
  })
})
