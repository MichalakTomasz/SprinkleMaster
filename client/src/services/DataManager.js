export class DataManager {
    constructor(mainController) {
        this.controller = mainController
    }
    getTasks = async () => this.controller.getTasks()
    addTask = async task => this.controller.addTask(task)
    updateTask = async task => this.controller.updateTask(task)

    getValves = async () => this.controller.getValves()

}