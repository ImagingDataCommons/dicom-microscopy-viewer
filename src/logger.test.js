import {
  Logger,
  LogLevel,
  applyViewerOptions,
  configureLogger,
  getLoggerOptions,
  logger,
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
    expect(testLogger.config.level).toBe(LogLevel.WARN)
  })

  it('reads explicit configureLogger input', () => {
    configureLogger({
      level: 'ERROR',
      enableInProduction: true,
      enableInDevelopment: false,
    })
    expect(getLoggerOptions().level).toBe('ERROR')
    expect(new Logger().config.level).toBe(LogLevel.ERROR)
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
    expect(new Logger().config.level).toBe(LogLevel.DEBUG)
  })

  it('setLogLevel updates global config without viewer construction', () => {
    setLogLevel('DEBUG')
    expect(getLoggerOptions().level).toBe('DEBUG')
    expect(new Logger().config.level).toBe(LogLevel.DEBUG)
  })

  it('applyViewerOptions does not reset level set by setLogLevel', () => {
    setLogLevel('DEBUG')
    applyViewerOptions({ debug: false })
    expect(getLoggerOptions().level).toBe('DEBUG')
  })
})
