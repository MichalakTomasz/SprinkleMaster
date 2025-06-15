import LogLevel from "../models/LogLevel.js"
import { formatStringMessage } from '../helpers/logHelper.js'

export default class LoggerService {
    #getAppRepository
    #fileLoggerService
    #suppressDbLogging = false
    #addConsoleLogging = false
    #addFileLogging = false
    #addDbLogging = false

    constructor(appRepository, fileLoggerService) {
        this.#getAppRepository = appRepository
        this.#fileLoggerService = fileLoggerService
    }
    
    get addConsoleLogging() {
        return this.#addConsoleLogging;
    }

    set addConsoleLogging(value) {
        this.#addConsoleLogging = value;
    }

    get addFileLogging() {
        return this.#addFileLogging;
    }

    set addFileLogging(value) {
        this.#addFileLogging = value;
    }

    get addDbLogging() {
        return this.#addDbLogging;
    }

    set addDbLogging(value) {
        this.#addDbLogging = value;
    }
    
    set suppressDbLogging(value) {
        this.#suppressDbLogging = value;
    }

    logInfo(message) {
        this.#log(message, LogLevel.INFO)
    }

    logDebug(message) {
        if (this.#isDebugMode()) {
            this.#log(message, LogLevel.DEBUG)
        }
    }

    logError(message) {
        this.#log(message, LogLevel.ERROR)
    }

    logWarning(message) {
        this.#log(message, LogLevel.WARNING)
    }

    #getJsonLog(message, level) {
        return { level: level, message: message, date: new Date().toLocaleString() }
    }

    #log(message, level) {
        if (this.#addConsoleLogging) {
            console.log(formatStringMessage(message, level))
        }

        const log = this.#getJsonLog(message, level)
        
        if (this.#addDbLogging && !this.#suppressDbLogging) {
            const appRepository = this.#getAppRepository()
            appRepository.logToDb(log)
        }

        if (this.#addFileLogging) {
            this.#fileLoggerService.log(log)
        }
    }
    
    #isDebugMode() {
        return process.execArgv.some(arg => /^--(inspect|debug)(-brk)?=?/.test(arg))
    }
}