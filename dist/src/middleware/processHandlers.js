import container from "../container/container.js"

const setupProcessHandlers = (server) => {
    if (!server) {
        throw new Error('Server instance must be provided to process handlers');
    }
    const loggerService = container.resolve('loggerService')

    const cleanup = async () => {
        try {
            const taskManager = container.resolve('taskManager')
            const tasks = await taskManager.getTasks().result
            if (tasks) {
                await Promise.all(tasks?.forEach(t => t.devices?.forEach(d => d.gpioPin.destroy())))
            }
            
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
    }

    const handleTermination = async (signal) => {
        try {
            loggerService.logInfo(`Received ${signal} signal.`)
            await cleanup()
            process.exit(0)
        } catch (e) {
            loggerService.logError(`Errod during shuddown message: ${e.message}`)
            loggerService.logError(`Errod during shuddown stack: ${e.stack}`)
            process.exit(1)
        }
    }

    const handleError = async (e) => {
        loggerService.logError(`Unhandled error: ${e.message}`)
        loggerService.logError(`Unhandled stack: ${e.stack}`)
        await cleanup()
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