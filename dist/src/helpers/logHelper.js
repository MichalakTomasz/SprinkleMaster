export const hasLogFields = (obj) => {
    const fields = ['date', 'level','message']
    
    return fields.every(f => f in obj)
}

export const formatMessageFromJson = (json) => `${json.date} - ${json.level} - ${json.message}\n`
export const formatStringMessage = (message, level) =>  `${new Date().toLocaleString()} - ${level} - ${message}`