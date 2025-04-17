export const taskDelay = (delay, cancellation = null) => {
    return new Promise((resolve) => {
        const taskId = setTimeout(() => {
            resolve();
        }, delay);

        if (cancellation) {
            cancellation.cancel = () => {
                clearTimeout(taskId);
                resolve();
            }
        }
    })
}

export const repeatTask = (callback, tick, cancellation) => {
    return new Promise((resolve, reject) => {
        const runner = async () => {
            if (cancellation?.isCancelled) {
                resolve()
                return
            }
        
            try {
                await callback()
                setTimeout(runner, tick)
            } catch (e) {
                reject(e)
            }
        }
        runner()
    })
}

export const waitTimes = async (times, delay) => {
    let count = 0
    while (count <= times) {
        await taskDelay(delay)
        count++
    }  
}

export const periodicTask = (callback, time, cancellation) => {
    return new Promise((resolve, reject) => {
        const runner = async () => {
            if (cancellation?.isCancelled) {
                resolve()
                return
            }
        
            try {
                    while (!cancellation?.isCancelled) {
                        const waitTime = computeTimeToExecute(time)
                        setTimeout(callback, waitTime)
                }
            } catch (e) {
                reject(e)
            }
        }
        runner()
    })
    waitTask(callback, time, cancellation)
}

export const waitTask = (callback, time, cancellation) => {
    const waitTime = computeTimeToExecute(time)
    
    return new Promise((resolve, reject) => {
        const runner = () => {
            if (cancellation?.isCancelled) {
                resolve()
                return
            }
        
            try {
                setTimeout(callback, waitTime)
                resolve()
            } catch (e) {
                reject(e)
            }
        }
        runner()
    })
}

const computeTimeToExecute = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    const now = new Date()
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentSeconds = now.getSeconds()
    const timeToExecute = (hours - currentHours) * 60 + (minutes - currentMinutes) - currentSeconds / 60
    return timeToExecute < 0 ? timeToExecute + 24 * 60 * 60 * 1000 : timeToExecute * 60 * 1000
}
