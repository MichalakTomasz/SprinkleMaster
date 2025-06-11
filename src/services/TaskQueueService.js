export default class TaskQueueService {
    constructor() {
        this.queue = [];
    }

    add(resolve, name) {
        const queueItem  = {
            resolve: resolve,
            timeoutId: null, 
            name: name} 
        this.queue.push(queueItem)

        return queueItem
    }

    remove(timeoutId) {
        if (!timeoutId) {
            return;
        }
        clearTimeout(timeoutId)
        const index = this.queue.indexOf(timeoutId)
        if (index > -1) {
            this.queue[index].resolve()
            this.queue.splice(index, 1)
        }
    }

    clearQueue() {
        this.queue.forEach(taskItem =>  {
            clearTimeout(taskItem.timeoutId)
            taskItem.resolve();
        })
        this.queue = [];
    }

    getQueue() {
        return this.queue.map(task => task.name);
    }

    getQueueSize() {
        return this.queue.length;
    }
}