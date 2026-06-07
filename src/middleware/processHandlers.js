import container from "../container/container.js"
import WebSocketMessageType from "../models/WebSocketMessageType.js"

const setupProcessHandlers = (server) => {
    if (!server) {
        throw new Error('Server instance must be provided to process handlers');
    }
    const loggerService = container.resolve('loggerService')
    const webSocketService = container.resolve('webSocketService')
    let cleanupPromise

    const cleanup = async ({ signal = 'shutdown', exitReason = 'Server shutting down.', closeCode = 1001 } = {}) => {
        if (cleanupPromise) {
            return cleanupPromise
        }

        cleanupPromise = (async () => {
            try {
                await webSocketService?.shutdown({
                    message: JSON.stringify({
                        type: WebSocketMessageType.ServerClosing,
                        payload: {
                            signal,
                            reason: exitReason,
                        },
                        timestamp: new Date(),
                    }),
                    code: closeCode,
                    reason: exitReason,
                })

                const taskManager = container.resolve('taskManager')
                const tasks = await taskManager.getTasks().result
                const gpioPins = tasks?.flatMap(task =>
                    task.devices
                        ?.map(device => device.gpioPin)
                        .filter(pin => pin && typeof pin.destroy === 'function') ?? []
                ) ?? []

                await Promise.all(gpioPins.map(pin => pin.destroy()))
                
                const dbContext = container.resolve('dbContext')
                if (dbContext?.sequelize) {
                    await dbContext.sequelize?.close()
                }
                
                if (server) {
                    await new Promise((resolve) => {
                        try {
                            if (server.listening) {
                                server.close((err) => {
                                    if (err) {
                                        loggerService.logError(`Error closing server: ${err.message}.`)
                                    } else {
                                        loggerService.logInfo('Server closed successfully.')
                                    }
                                    resolve()
                                })
                            } else {
                                resolve()
                            }
                        } catch (err) {
                            loggerService.logError(`Error during server cleanup: ${err.message}.`)
                            resolve()
                        }
                    })
                }
                
                loggerService.logInfo('Cleanup completed successfully.')
            } catch (e) {
                loggerService.logError(`Cleanup failed: ${e.message}.`)
            }
        })()

        return cleanupPromise
    }

    const handleTermination = async (signal) => {
        try {
            loggerService.logInfo(`Received ${signal} signal.`)
            await cleanup({ signal, exitReason: `Server is shutting down because of ${signal}.` })
            process.exit(0)
        } catch (e) {
            loggerService.logError(`Error during shuddown message: ${e.message}`)
            loggerService.logError(`Error during shuddown stack: ${e.stack}`)
            process.exit(1)
        }
    }

    const handleError = async (e) => {
        loggerService.logError(`Unhandled error: ${e.message}`)
        loggerService.logError(`Unhandled stack: ${e.stack}`)
        await cleanup({ signal: e.name ?? 'error', exitReason: 'Server is shutting down because of an unhandled error.', closeCode: 1011 })
        process.exit(1)
    }
    
    ['SIGTERM', 'SIGINT', 'SIGUSR2'].forEach(signal => {
        process.on(signal, () => handleTermination(signal))
    })

    process.on('uncaughtException', handleError) 
    process.on('unhandledRejection', handleError)
   
    return cleanup 
}

export default setupProcessHandlers