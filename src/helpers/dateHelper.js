import container from "../container/container.js"

export const formatTime = stringTime => {
    const loggerService = container.resolve('loggerService')
    if (!stringTime || typeof stringTime !== 'string') {
        return null
    }
    
    try {
        const [hours, minutes] = stringTime.split(':').map(Number)
        if (isNaN(hours) || isNaN(minutes)) {
            return null
        }
        
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        
        return date.toISOString()
    } catch (e) {
        loggerService.logError(`Error formatting time: ${e.message}`)
        return null
    }
}  