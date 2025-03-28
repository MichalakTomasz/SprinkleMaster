import fs from 'fs'

const utf8 = 'utf8'

export default class ConfigurationService {
    getConfig() {
        return JSON.parse(fs.readFileSync('./appsettings.json', utf8))
    }

    saveServerIp(path, ipAddress) {
        fs.writeFileSync(path, JSON.stringify({ ipAddress: ipAddress }), utf8)
    }
}