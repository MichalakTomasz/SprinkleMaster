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
