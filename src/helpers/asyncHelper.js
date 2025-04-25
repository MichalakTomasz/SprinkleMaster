export const taskDelay = async delayTime =>
    new Promise(resolve =>
        setTimeout(resolve, delayTime))

export const periodicTask = args =>
    new Promise((resolve, reject) => {
        let setTimeoutId = null
        const runner = async () => {
            try {
                const time = args.isStart ? args.task.start : args.task.stop
                while (!args.cancellation?.isCancelled) {
                    const milisecondsToExecute = computeMilisecondsToExecute(time)
                    const executeTimie = computeExecuteTime(milisecondsToExecute)
                    const timeToExecute = computeTimeToExecute(milisecondsToExecute)

                    args.logger.logInfo(`Next ${args.isStart ? 'Start' : 'Stop'} Task: ${args.task.name}, device: ${args.device.name} will be at ${executeTimie}.`)
                    args.logger.logInfo(`Time to next execute: ${timeToExecute}.`)

                    await taskDelay(milisecondsToExecute)
                    await args.callback()
                }

                clearTimeout(setTimeoutId)
                args.logger.logInfo(`Periodic Task: ${args.task.name}, device: ${args.device.name} cancelled.`)
                resolve()
            } catch (e) {
                args.logger.logError(`Creating periodic Task error: ${e.message}.`)
                args.logger.logError(`Creating periodic Task error stack: ${e.stack}.`)
                reject(e)
            }
        }

        runner()
    })

export class CancellationToken {
    constructor() {
        this.isCancelled = false
    }

    cancel() {
        this.isCancelled = true
    }
}

const computeMilisecondsToExecute = time => {
    const [hours, minutes] = time.split(':').map(Number)
    const now = new Date()
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentSeconds = now.getSeconds()
    const currentMilliseconds = now.getMilliseconds()
    const timeToExecute = (((((hours - currentHours) * 60) + (minutes - currentMinutes)) * 60) - currentSeconds) * 1000 - currentMilliseconds

    return timeToExecute < 0 ? timeToExecute + (24 * 60 * 60 * 1000) : timeToExecute
}

const computeExecuteTime = waitTime => {
    let now = new Date().getTime()
    now += waitTime
    const nextTime = new Date(now)
    const hours = nextTime.getHours()
    const minutes = nextTime.getMinutes()

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const computeTimeToExecute = waitTime => {
    const totalSeconds = Math.floor(waitTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${hours.toString().padStart(2, '0')} hours ${minutes.toString().padStart(2, '0')} minutes`
}