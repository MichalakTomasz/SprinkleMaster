export const taskDelay = async args  => {
    const promise = new Promise(resolve => {
        args.timeoutId = setTimeout(resolve, args.milisecondsToExecute)
    })
    
    return promise
}

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

const pad = (n) => n.toString().padStart(2, '0');
const formatDate = () => {
    const date = new Date();
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}-${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export const periodicTask = args =>
    new Promise((resolve, reject) => {
        const runner = async () => {
            try {
                const time = args.isStart ? args.task.start : args.task.stop
                const taskName = `${formatDate()} Name: ${args.task.name} ${args.isStart ? 'Start' : 'Stop'}`
                const queueItem = args.taskQueueService.add(resolve, taskName)
                while (!args.cancellationToken?.isCancelled) {
                    const milisecondsToExecute = computeMilisecondsToExecute(time)
                    const executeTime = computeExecuteTime(milisecondsToExecute)
                    const timeToExecute = computeTimeToExecute(milisecondsToExecute)

                    args.logger.logInfo(`Next ${args.isStart ? 'Start' : 'Stop'} Task: ${args.task.name} will be at ${executeTime}.`)
                    args.logger.logInfo(`Time to next execute: ${timeToExecute}.`)
                    queueItem.milisecondsToExecute = milisecondsToExecute

                    await taskDelay(queueItem)
                    if (!args.cancellationToken?.isCancelled) {
                        await args.callback()
                    }
                }
                args.taskQueueService.remove(queueItem.timeoutId)
                args.logger.logInfo(`Periodic Task: ${args.task.name} cancelled.`)
            } catch (e) {
                args.logger.logError(`Periodic Task error: ${e.message}.`)
                args.logger.logError(`Periodic Task error stack: ${e.stack}.`)
                reject()
            }
        }

        runner()
    })