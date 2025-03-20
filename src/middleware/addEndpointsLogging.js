import container from "../container/container.js";

const addEndpointsLogging = (req, res, next) => {
    if (req.method != 'GET') {
        const loggerService = container.resolve('loggerService')

        const body = req?.body ? JSON.stringify(req.body) : null
        if (body) {
            loggerService.logInfo(`Request received: ${req.method} ${req.url} ${body}`)
        } else {
            loggerService.logInfo(`Request received: ${req.method} ${req.url}`)
        }

        const originalSend = res.send.bind(res)
        res.send = (body) => {
            loggerService.logInfo(`Response send: ${res.statusCode} ${body}`)
            return originalSend.call(this, body)
        }

        res.on('finish', (body) => {
            loggerService.logInfo(`Response send: ${res.statusCode} ${res.statusMessage}`)
        })
    }
    
    next()
}

export default addEndpointsLogging