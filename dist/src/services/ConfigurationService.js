import fs from 'fs'

export default class ConfigurationService {
    getConfig() {
        return JSON.parse(fs.readFileSync('./appsettings.json', 'utf8'))
    }
}