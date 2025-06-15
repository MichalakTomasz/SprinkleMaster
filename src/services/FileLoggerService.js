import fs from 'fs'
import  { hasLogFields, formatMessageFromJson } from '../helpers/logHelper.js'

const wrongJsonSchema = 'Wrong json log schema.'
const utf8 = 'utf8'

export default class FileLoggerService {
    #path

    constructor(configurationService) {
        this.#path = configurationService.getConfig().fileLogPath
    }

    log(log) {
        try {
            if (typeof log == String) {
                fs.appendFileSync(this.#path, message, utf8)
            }
            if (typeof log === 'object') {
                if (!hasLogFields(log)) {
                    console.error(wrongJsonSchema)
                    return
                }
                fs.appendFileSync(this.#path, formatMessageFromJson(log), utf8)
            }
        } catch (e) {
            cosole.error(e)
        }
    }

    async logAsync(log) {
        if (!log)
            return

        if (typeof log === String) {
            fs.appendFile(this.#path, log, utf8)
        }

        if (typeof log  === 'object') {
            if (!hasLogFields(log)) {
                console.error(wrongJsonSchema)
                return
            }

            fs.appendFile(this.#path, formatMessageFromJson(log), utf8, e => {
                if (e) console.error(e)
            })
        }
    }
}