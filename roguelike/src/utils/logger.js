const logger = {
    logLevels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        hide: 4
    },
    logLevel: 0,
    setLogLevel (level) {
        this.logLevel = this.logLevels[level]
    },
    debug(...text) {
        if (this.logLevel >= this.logLevels.debug) {
            console.debug(...text)
        }
    },
    info(...text) {
        if (this.logLevel >= this.logLevels.info) {
            console.log(...text)
        }
    },
    warn(...text) {
        if (this.logLevel >= this.logLevels.warn) {
            console.warn(...text)
        }
    },
    error(...text) {
        if (this.logLevel >= this.logLevels.error) {
            console.error(...text)
        }
    },
}

window.logger = logger

export { logger }