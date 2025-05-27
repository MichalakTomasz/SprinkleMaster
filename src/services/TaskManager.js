import { isGpioCommonPin } from '../helpers/pinHelper.js'
import StatusCode from '../models/StatusCode.js'
import PinState from '../models/PinState.js'
import { CreateServerTask, CreateClientTask } from '../helpers/taskHelper.js'
import { CreateServerDevice, CreateClientDevice, UpdateServerDevice } from '../helpers/deviceHelper.js'
import { taskDelay, periodicTask, CancellationToken } from '../helpers/asyncHelper.js'
import Settings from '../models/Settings.js'
import { shouldWater } from './weatherService.js'

const taskNotFound = 'Task not found.'
const emptyData = 'Empty data ware passed.'
const notCommonPin = 'are not for common use.'
const taskWithTheSameName = 'There is Task with the same Name.'
const pumpNotExists = 'The Pump not exests.'
const keNotFound = 'Key not found.'
const Pump = 'PUMP'
const Valve = 'VALVE'

export default class TaskManager {
    #cancellationToken
    #repository
    #loggerService
    #settings = []
    #valves = []
    #valveTasks = []
    #pump = null

    #isSchedulerEnabled = false

    constructor(appRepository, loggerService) {
        this.#loggerService = loggerService
        this.#repository = appRepository
        this.#init()
    }

    #init = async () => {
        try {
            await this.#initSettings()
            const pump = await this.#repository.getDeviceByName('Pump')
            this.#pump = pump ? CreateServerDevice(pump) : null

            await this.#reloadTasks()

            const devices = await this.#repository.getDevices()
            const valves = devices?.filter(d => d.type.name == Valve)
            if (valves?.length > 0) {
                this.#valves = valves.map(v => CreateServerDevice(v))
            }

            const areActiveTasks = this.#valveTasks.some(v => v.isActive)
            if (this.#settings.find(s => s.key == Settings.autostartScheduler)?.value && this.#pump && areActiveTasks) {
                this.runScheduler()
            }
        } catch (e) {
            this.#loggerService.logError(`TaskManager initialization error: ${e.message}`)
        }
    }

    #reloadTasks = async () => {
        const tasks = await this.#repository.getTasks()
        if (tasks?.length > 0) {
                this.#valveTasks = tasks.map(t => CreateServerTask(t))
        }
    }

    #initSettings = async () => {
        const settings = await this.#repository.getSettings()
        if (settings?.length > 0) {
            this.#settings = settings?.map(s => ({ key: s.key, value: s.value }))
        }
    }

    //#region task
    getTasks = () => {
        return {
            isSuccess: true,
            result: this.#valveTasks,
            status: StatusCode.Ok
        }
    }

    getTaskById = id => {
        const result = this.#valveTasks?.find(t => t.id == id)
        return result ? { isSuccess: true, result: result, status: StatusCode.Ok } :
            { isSuccess: false, message: taskNotFound, status: StatusCode.BadRequest }
    }

    getTaskByName = name => {
        const result = this.#valveTasks?.find(t => t.name === name)
        return result ? { isSuccess: true, result: result, status: StatusCode.Ok } :
            { isSuccess: false, message: taskNotFound, status: StatusCode.BadRequest }
    }

    addTask = async task => await this.#trackScheduler(async () => {
        if (!task)
            return { isSuccess: false, message: emptyData, status: StatusCode.BadRequest }

        const pinsNotForCommonUse = task.devices?.filter(d => !isGpioCommonPin(d.pinNo)).map(d => d.pinNo)
        if (pinsNotForCommonUse?.length > 0)
            return {
                isSuccess: false,
                message: `Pins: ${pinsNotForCommonUse.join(', ')} ${notCommonPin}`,
                status: StatusCode.BadRequest
            }

        if (this.#isAnotherWithTheSameName(task))
            return { isSuccess: false, message: taskWithTheSameName, status: StatusCode.BadRequest }

        if (this.#isInTaskDeviceWithTheSamePin(task))
            return { isSuccess: false, message: 'This Task contains devices with the same pin number.', status: StatusCode.BadRequest }

        this.pauseScheduler()

        const resultTask = await this.#repository.addTask(task)
        if (!resultTask.isSuccess)
            return resultTask

        const newTask = CreateServerTask(resultTask.result)
        this.#valveTasks.push(newTask)

        return {
            isSuccess: true,
            message: 'Task has been added successful.',
            result: CreateClientTask(newTask),
            status: resultTask.status
        }
    })

    updateTask = async task => await this.#trackScheduler(
        async () => {
            if (!task)
                return { isSuccess: false, message: emptyData, status: StatusCode.BadRequest }

            const pinsNotForCommonUse = task.devices?.filter(d => !isGpioCommonPin(d.pinNo)).map(d => d.pinNo)
            if (pinsNotForCommonUse?.length > 0)
                return {
                    isSuccess: false,
                    message: `Pins: ${pinsNotForCommonUse.join(', ')} ${notCommonPin}`,
                    status: StatusCode.BadRequest
                }

            if (this.#isTheSameTask(task))
                return { 
                    isSuccess: false, 
                    message: 'The same Task already exists.', 
                    status: StatusCode.BadRequest }

            this.pauseScheduler()

            const updateResult = await this.#repository.updateTask(task)
            if (!updateResult.isSuccess)
                return updateResult

            const beforeUpdateTask = this.#valveTasks.find(t => t.id == task.id)
            if (!beforeUpdateTask)
                return {
                    isSuccess: false,
                    message: 'Error,Server Task not found.',
                    status: StatusCode.InternalServerError
                }

            beforeUpdateTask.name = task.name
            beforeUpdateTask.start = task.start
            beforeUpdateTask.stop = task.stop
            beforeUpdateTask.period = task.period
            beforeUpdateTask.isActive = task.isActive

            // const updatedIndex = this.#valveTasks.findIndex(t => t.id == task.id)
            // this.#valveTasks.splice(updatedIndex, 1, CreateServerTask(beforeUpdateTask))

            const updatedTask = this.#valveTasks.find(t => t.id == task.id)

            return {
                isSuccess: true,
                message: 'Task updated successful.',
                result: CreateClientTask(updatedTask),
                status: StatusCode.Ok
            }
        })

    deleteTask = async id => await this.#trackScheduler(async () => {
        if (!id)
            return { isSuccess: false, message: emptyData, status: StatusCode.BadRequest }

        const task = this.#valveTasks.find(t => t.id == id)
        if (!task)
            return { isSuccess: false, message: taskNotFound, status: StatusCode.BadRequest }

        this.pauseScheduler()

        task.devices?.forEach(d => d.gpioPin.destroy())
        const taskIndex = this.#valveTasks.indexOf(task)

        if (taskIndex < 0)
            return { isSuccess: false, message: taskNotFound, status: StatusCode.InternalServerError }

        this.#valveTasks.splice(taskIndex, 1)

        const result = await this.#repository.deleteTask(id)

        return result ? { 
            isSuccess: true, 
            message: 'Task has been deleted.' ,
            status: StatusCode.Ok
        } :
            { 
                isSuccess: false, 
                message: 'Delete Task, database returned error.', 
                status: StatusCode.InternalServerError }
    })

    assignToTask = async (taskId, valveId) =>
        await this.#trackScheduler(async () => {
            const assignResult = await this.#repository.assignToTask(taskId, valveId)
            if (!assignResult.isSuccess)
                return assignResult

            const valveToAssign = this.#valves.find(v => v.id == valveId)
            if (!valveToAssign)
                return {
                    isSuccess: false,
                    message: 'Find server device to assign error.'
                }

            const task = this.#valveTasks.find(v => v.id == taskId)
            if (!task)
                return {
                    isSuccess: false,
                    message: 'Server task not found.',
                    status: StatusCode.InternalServerError
                }

            const taskValve = task.devices?.find(d => d.id == valveId)
            if (taskValve)
                return {
                    isSuccess: false,
                    message: 'Device is alredy assigned to Task.',
                    status: StatusCode.InternalServerError
                }

            const assignServerResult = task.devices?.push(valveToAssign)
            if (!assignServerResult)
                return {
                    isSuccess: false,
                    message: 'Assign server Valve returned error.',
                    status: StatusCode.InternalServerError
                }

            return {
                isSuccess: true,
                message: 'Assign Valve to Task success.',
                status: StatusCode.Ok
            }
        })

    unassignFromTask = async (taskId, valveId) =>
        await this.#trackScheduler(async () => {

            this.pauseScheduler()

            const unassignResult = await this.#repository.unassignFromTask(taskId, valveId)
            if (!unassignResult.isSuccess)
                return unassignResult

            const task = this.#valveTasks.find(t => t.id == taskId)
            const valveToUnassign = task.devices.find(d => d.id == valveId)
            if (!valveToUnassign)
                return {
                    isSuccess: false,
                    message: 'Find server Valve error.',
                    status: StatusCode.InternalServerError
                }
            const valveIndexToUnassign = task.devices.indexOf(valveToUnassign)
            if (valveIndexToUnassign < 0) {
                return {
                    isSuccess: false,
                    message: "Find server tasak index error.",
                    status: StatusCode.InternalServerError
                }
            }

            const unassignServerResult = task.devices.splice(valveIndexToUnassign, 1)
            if (!unassignServerResult)
                return {
                    isSuccess: false,
                    message: 'Unassign server Valve returned error.',
                    status: StatusCode.InternalServerError
                }

            return {
                isSuccess: true,
                message: 'Unassign Valve to Task success.',
                status: StatusCode.Ok
            }
        })
    //#endregion

    //#region Valves

    getValves = () => {
        return {
            isSuccess: true,
            result: this.#valves,
            status: StatusCode.Ok
        }
    }

    addValve = async valve => await this.#trackScheduler(async () => {
        if (this.#isDeviceWithTheSameName(valve))
            return {
                isSuccess: false,
                message: 'Valve with this name alredy exists.',
                status: StatusCode.BadRequest
            }

        if (this.#isDeviceWithTheSamePinNo(valve))
            return {
                isSuccess: false,
                message: 'Valve with the same GPIO Pin number alredy exists.',
                status: StatusCode.BadRequest
            }
        
        if (this.#pump.pinNo == valve.pinNo)
            return {
                isSuccess: false,
                message: 'This GPIO Pin number is reserved for The Pump.',
                status: StatusCode.BadRequest
            }

        this.pauseScheduler() 

        const addResult = await this.#repository.addDevice({
            ...valve,
            type: 'VALVE'})
        if (!addResult.isSuccess)
            return addResult

        const serverValve = CreateServerDevice(addResult.result)
        this.#valves.push(serverValve)

        return {
            isSuccess: true,
            result: CreateClientDevice(serverValve),
            status: StatusCode.Created
        }
    })

    updateValve = async valve => await this.#trackScheduler(async () => {
        const isDeviceWithTheSameName = this.#isDeviceWithTheSameName(valve)
        const isDeviceWithTheSamePinNo = this.#isDeviceWithTheSamePinNo(valve)
        if (isDeviceWithTheSameName && (isDeviceWithTheSamePinNo || this.#isTheSamePumpPinNo(valve.pinNo)))
            return {
                isSuccess: false,
                message: 'Valve with this name alredy exists.',
                status: StatusCode.BadRequest
            }

        if ((isDeviceWithTheSamePinNo || this.#isTheSamePumpPinNo(valve.pinno)) && isDeviceWithTheSameName)
            return {
                isSuccess: false,
                message: 'Device with the same GPIO Pin number alredy exists.',
                status: StatusCode.BadRequest
            }

        this.pauseScheduler()

        const updateResult = await this.#repository.updateDevice(valve)
        if (!updateResult.isSuccess)
            return {
                isSuccess: false,
                message: 'Update Valve returned error.',
                status: StatusCode.InternalServerError
            }

        const serverValve = this.#valves.find(v => v.id == valve.id)
        if (!serverValve)
            return {
                isSuccess: false,
                message: 'Error: The Server Valve not found.',
                status: StatusCode.InternalServerError
            }

        UpdateServerDevice(serverValve, valve)

        return {
            isSuccess: true,
            status: StatusCode.Ok
        }
    })

    deleteValve = async id => await this.#trackScheduler(async () => {
        const toDelete = await this.#repository.getDeviceById(id)
        if (!toDelete)
            return {
                isSuccess: false,
                message: `The Valve with id ${id} not exests.`,
                status: StatusCode.BadRequest
            }

        this.pauseScheduler()

        const deleteResult = await this.#repository.deleteDevice(id)
        if (!deleteResult || deleteResult == 0)
            return {
                isSuccess: false,
                message: 'Delete Valve returned error.',
                status: StatusCode.InternalServerError
            }

        const valveToDelete = this.#valves.find(v => v.id == id)
        if (!valveToDelete)
            return {
                isSuccess: false,
                message: 'Find server Valve returned error.',
                status: StatusCode.InternalServerError
            }
        
        const areEveryOtherclosed = this.#valves.every(v => v.id != valveToDelete.id && v.gpioPin.getState() == PinState.LOW)
        const isValveToDeleteOpen = valveToDelete.gpioPin.getState() == PinState.HIGH
        if (areEveryOtherclosed && isValveToDeleteOpen)
            this.#pump?.setState(PinState.LOW)

        valveToDelete.gpioPin.destroy()

        const indexToDelete = this.#valves.indexOf(valveToDelete)
        if (indexToDelete < 0)
            return {
                isSuccess: false,
                message: 'Server Valve not found.',
                status: StatusCode.InternalServerError
            }

        this.#valves.splice(indexToDelete, 1)

        await this.#reloadTasks()

        return {
            isSuccess: true,
            message: 'The Valve has been deleted successful.',
            status: StatusCode.Ok
        }
    })

    //#endregion

    //#region pump
    getPump = () => {
        if (!this.#pump)
            return { isSuccess: false, message: pumpNotExists, status: StatusCode.BadRequest }

        return { isSuccess: true, result: CreateClientDevice(this.#pump), status: StatusCode.Ok }
    }

    addPump = async pinNo => await this.#trackScheduler(async () => {
        if (this.#pump)
            return { isSuccess: false, message: 'The pump alredy exists.', status: StatusCode.BadRequest }

        if (!pinNo)
            return { isSuccess: false, message: emptyData, status: StatusCode.BadRequest }

        const isPinReserved = this.#valves.some(d => d.pinNo == pinNo)
        if (isPinReserved)
            return { isSuccess: false, message: 'This pin is alredy reserved by another device.', status: StatusCode.BadRequest }

        this.pauseScheduler()

        const addPumpResult = await this.#repository.addDevice({
            name: 'Pump',
            pinNo: pinNo,
            type: Pump
        })

        if (!addPumpResult.isSuccess)
            return addPumpResult

        this.#pump = CreateServerDevice(addPumpResult.result)

        return { isSuccess: true, message: 'The Pump has been added.', status: StatusCode.Created, result: CreateClientDevice(this.#pump) }
    })

    changePumpPinNo = async pinNo => await this.#trackScheduler(async () => {
        if (!pinNo)
            return { isSuccess: false, message: emptyData, status: StatusCode.BadRequest }

        if (!this.#pump)
            return { isSuccess: false, message: pumpNotExists, status: StatusCode.BadRequest }

        const isPinReserved = this.#valves.some(d => d.pinNo == pinNo)
        if (isPinReserved)
            return { isSuccess: false, message: 'This pin is alredy reserved by another device.', status: StatusCode.BadRequest }

        this.pauseScheduler()

        const pumpResult = await this.#repository.getDeviceByName('Pump')
        if (!pumpResult)
            return { isSuccess: false, message: 'Get pump returned error', status: StatusCode.InternalServerError }

        pumpResult.pinNo = pinNo

        const changePinResult = await this.#repository.updateDevice({
            id: pumpResult.id,
            name: pumpResult.name,
            pinNo: pumpResult.pinNo,
            type: pumpResult.type
        })
        if (!changePinResult.isSuccess) {
            return changePinResult
        }

        const newPumpData = {
            name: this.#pump.name,
            type: this.#pump.type,
            pinNo: pinNo            
        }
        UpdateServerDevice(this.#pump, newPumpData)

        return { 
            isSuccess: true, 
            message: 'The Pump pin number updated successful.', 
            status: StatusCode.Ok }
    })

    deletePump = async () => await this.#trackScheduler(async () => {
        if (!this.#pump)
            return { isSuccess: false, message: pumpNotExists, status: StatusCode.BadRequest }

        this.pauseScheduler()

        await this.turnOffPump(this.#settings.find(s => s.key == Settings.pumpStopDelay)?.value)

        const deleteResult = await this.#repository.deleteDevice(this.#pump.id)
        if (!deleteResult.isSuccess)
            return deleteResult

        this.#pump = null

        return { isSuccess: true, message: 'The Pump has been deleted successful.', status: StatusCode.Ok }
    })

    turnOffPump = async (pumpStopDelay = 3000) => await this.#trackScheduler(async () => {
        const pump = this.#pump
        if (!pump)
            return { isSuccess: false, message: 'Pump device not found.', status: StatusCode.BadRequest }

        this.pauseScheduler()

        pump.gpioPin.setState(PinState.LOW)

        const pumpState = pump.gpioPin.getState()
        if (pumpState != PinState.LOW)
            return {
                isSuccess: false,
                message: 'Turn off the Pump fault.',
                status: StatusCode.InternalServerError, result: pumpState
            }

        const areAnyOpenValve = this.#valves.some(v => v.gpioPin.getState() == PinState.HIGH)
        if (areAnyOpenValve) {
            await taskDelay(pumpStopDelay || 3000)
        }
        
        const faultResults = this.#valves.filter(v => {
            v.gpioPin.setState(PinState.LOW)
            const valveState = v.gpioPin.getState()

            return valveState != PinState.LOW
        })

        if (faultResults.length > 0)
            return {
                isSuccess: false,
                message: 'The Pump was turned off, but not every valves are cloesd.',
                status: StatusCode.InternalServerError
            }

        return {
            isSuccess: true,
            message: 'The Pump has been turned off and all Valves are closed.',
            status: StatusCode.Ok
        }
    })

    #turnOfThePumpBeforeCloseLastValve = async () => {
        const countOpenValves = this.#valves.filter(v => v.gpioPin.getState() == PinState.HIGH).length
            if (countOpenValves == 1) {
                this.#pump?.gpioPin.setState(PinState.LOW)
                const delay = this.getSettingsByKey(Settings.pumpStopDelay)?.result?.value ?? 3000
                const pumpState = this.#pump.gpioPin.getState()
                await taskDelay(delay)
                if (pumpState != PinState.LOW)
                    return {
                        isSuccess: false,
                        message: 'Trying to close last valve, but the Pump could not be turn off.'
                }
                else {
                    return {
                        isSuccess: true,
                        message: 'The Pump has been turned off.'
                    }
                }
            }
    }
    //#endregion

    //#region valve - Task States
    
    changeTaskStates = async (id, state) => await this.#trackScheduler(async () => {
        const task = this.#valveTasks.find(t => t.id == id)
        const devices = task?.devices

        if (!devices)
            return {
                isSuccess: false,
                message: 'No Task with this id.',
                status: StatusCode.BadRequest
            }

        this.pauseScheduler()

        if (state == PinState.HIGH) {
            const pumpResult = this.#ensurePumpTurnedOn()
            if (!pumpResult?.isSuccess)
                return pumpResult
        }

        if (state == PinState.LOW) {
            const areAnyOtherValvesOpen = this.#valveTasks.some(t => t.id != task.id && 
                t.devices?.some(v => v.gpioPin.getState() == PinState.HIGH))
            
            const areSomeTaskValvesOpen = devices.some(v => v.gpioPin.getState() == PinState.HIGH)
            if (!areAnyOtherValvesOpen && areSomeTaskValvesOpen) {
                this.#pump?.gpioPin.setState(PinState.LOW)
                const delay = parseInt(this.#settings.find(s => s.key == Settings.pumpStopDelay)?.value)
                await taskDelay(delay)
                const pumpState = this.#pump.gpioPin.getState()
                if (pumpState != PinState.LOW) {
                    return {
                        isSuccess: false,
                        message: `Error, only Valves form task ${task.name} are open, but the Pump could not be turnted off before Valves close.`,
                        status: StatusCode.InternalServerError
                    }
                }
            }
        }

        const faultList = devices.filter(d => {
            d.gpioPin.setState(state)
            return state != d.gpioPin.getState()
        })

        if (faultList?.length > 0)
            return {
                isSuccess: false,
                message: `Error devices: ${faultList.map(d => d.id + ', ')} have not expected state.`,
                status: StatusCode.InternalServerError
            }

        return {
            isSuccess: true,
            message: `Task Valves state changed to state ${state}.`,
            status: StatusCode.Ok
        }
    })

    closeAllValves = async () => await this.#trackScheduler(async () => {
        const delay = this.#settings.find(s => s.key == Settings.pumpStopDelay)?.valve
        const shutdownPumpResult = await this.turnOffPump(delay)
        if (!shutdownPumpResult.isSuccess)
            return shutdownPumpResult

        if (this.#valves.length == 0)
            return {
                isSuccess: true,
                message: 'The Pump was turned off, but no valves found. So there are no valves to close.',
                status: StatusCode.Ok
            }

        const faultList = this.#valves.filter(v => {
            v.gpioPin.setState(PinState.LOW)
            return v.gpioPin.getState() != PinState.LOW
        })

        if (faultList?.length > 0)
            return {
                isSuccess: false,
                message: `Error, devices: ${faultList.map(d => d.name + ', ')} was no closed.`,
                status: StatusCode.InternalServerError
            }

        return {
            isSuccess: true,
            message: `The Pump and every staged valves was closed.`,
            status: StatusCode.Ok
        }
    })

    //Get current state of The Valve
    getValveState = id => {
        const valve = this.#valves.find(v => v.id == id)
        if (!valve)
            return {
                isSuccess: false,
                message: `Server valve id ${id} not found.`,
                status: StatusCode.BadRequest
            }

        const valveState = valve.gpioPin.getState()
        return {
            isSuccess: true,
            result: {
                id: valve.id,
                name: valve.name,
                state: valveState
            },
            status: StatusCode.Ok
        }
    }

    //Search every registered device for pinNo and get current state
    getPinState = pinNo => {
        let state = this.#valves.find(v => v.pinNo == pinNo)?.gpioPin.getState()
        if (!state)
            state = this.#pump?.gpioPin.getState()

        if (!state)
            return {
                isSuccess: false,
                message: `No device with pin no: ${pinNo}.`,
                status: StatusCode.BadRequest
            }

        return {
            isSuccess: true,
            result: {
                pinNo: pinNo,
                state: state
            },
            status: StatusCode.Ok
        }
    }

    changeValveState = (id, state) => {
        const pinNo = this.#valves.find(v => v.id == id)?.pinNo
        if (!pinNo)
            return {
                isSuccess: false,
                message: 'Error server Valve not found.',
                status: StatusCode.BadRequest
            }

        return this.changePinState(pinNo, state)
    }

    changePinState = (pinNo, state) => this.#trackScheduler(async () => {
        const device = this.#valves?.find(d => d.pinNo == pinNo)
        if (!device)
            return {
                isSuccess: false,
                message: noTaskWithCurrentPinNo,
                status: StatusCode.BadRequest
            }

        this.pauseScheduler()

        if (state == PinState.HIGH) {
            const pumpResult = this.#ensurePumpTurnedOn()
            if (!pumpResult?.isSuccess)
                return pumpResult
        }       

        if (state == PinState.LOW) {
            await this.#turnOfThePumpBeforeCloseLastValve()
        }

        device.gpioPin.setState(state)
        const deviceCurrentState = device.gpioPin.getState()
        if (deviceCurrentState != state)
            return {
                isSuccess: false,
                message: `Change valveState returns error. Current Pin state: ${deviceCurrentState}`,
                status: StatusCode.InternalServerError,
                result: deviceCurrentState
            }

        return {
            isSuccess: true,
            message: 'Valve state has been changed.',
            status: StatusCode.Ok,
            result: deviceCurrentState
        }
    })
    //#endregion

    //#region Scheduler
    getIsSchedulerEnabled = () => this.#isSchedulerEnabled

    runScheduler = () => {
        const tasks = this.#valveTasks.filter(t => t.isActive)
        if (!tasks || tasks?.length == 0)
            return false

        this.#isSchedulerEnabled = true
        this.#cancellationToken = new CancellationToken()
        this.#createPeriodicTasks(tasks)

        this.#loggerService.logInfo('Scheduler has been started.')

        return true
    }

    stopScheduler = () => {
        this.#isSchedulerEnabled = false
        this.#cancellationToken?.cancel()
        this.#loggerService.logInfo('Scheduler has been stopped.')

        return true
    }

    pauseScheduler = () => {
        this.#cancellationToken?.cancel()
        this.#loggerService.logInfo('Scheduler has been paused.')

        return true
    }
    //#endregion

    //#region settings
    getSettings = () => {
        return {
            isSuccess: true,
            result: this.#settings,
            status: StatusCode.Ok
        }
    }

    getSettingsByKey = key => {
        const settingsResult = this.#settings.find(s => s.key == key)
        if (!settingsResult)
            return {
                isSuccess: false,
                message: keNotFound,
                status: StatusCode.BadRequest
            }

        return {
            isSuccess: true,
            result: settingsResult,
            status: StatusCode.Ok
        }
    }

    updateSettings = async (settings) => {
        const result = {}

        for (const setting of settings) {
            if (!this.#settings.some(s => s.key == setting.key)) {
                result = {
                    isSuccess: false,
                    message: keyNotFound,
                    status: StatusCode.BadRequest
                }
                break;
            }
                
            const updateResult = await this.#repository.updateSettingsValue(setting.key, setting.value)
            if (!updateResult?.isSuccess) {
                return updateResult
            }

            const settinig = this.#settings.find(s => s.key == setting.key)
            settinig.value = setting.value
        }
        
        return {
            isSuccess: true, 
            status: StatusCode.Ok,
            message: 'Update settings successful.'
        }
    }
    //#endregion
    //#region Weather prediction

    getWeatherPredictions = async () => {
        const predictions = await this.#repository.getWeatherPredictions()
        return {
            isSuccess: true,
            result: predictions,
            status: StatusCode.Ok
        }
    }
    //#endregion

    #ensurePumpTurnedOn = () => {
        if (!this.#pump)
            return {
                isSuccess: false,
                message: 'No Pump is defined.',
                status: StatusCode.BadRequest
            }

        const pump = this.#pump
        const currentPumpState = pump.gpioPin.getState()
        if (currentPumpState != PinState.HIGH) {
            pump.gpioPin.setState(PinState.HIGH)
        }
        
        const isPumpTurnedOn = pump.gpioPin.getState()

        return isPumpTurnedOn != PinState.HIGH ? {
            isSuccess: false,
            message: 'Error could not start the Pump.',
            status: StatusCode.InternalServerError
        } : {
            isSuccess: true,
            message: 'The Pump is turned on.',
            status: StatusCode.InternalServerError
        }
    }

    #createPeriodicTasks = tasks => {
        const taskCallback = async args => {
            if (args.cancellationToken?.isCancelled)
                return

            args.logger.logInfo(`Changing task: ${args.task.name} to state: ${args.state}`)
            if (args.state == PinState.HIGH) {
                const useWeatherAssistant = this.getSettingsByKey(Settings.useWeatherAssistant)?.result.value ?? false
                const shouldStart = await shouldWater({ logger: this.#loggerService, repository: this.#repository })
                if (!this.getIsSchedulerEnabled() || (useWeatherAssistant && !shouldStart))
                    return

                this.#ensurePumpTurnedOn()
            }
            else {
                const areOtherOpenValves = args.devices?.some(d => 
                    !args.task.devices?.some(td => td.id == d.id) && d.gpioPin.getState() == PinState.HIGH)
                if (!areOtherOpenValves) {
                    this.#pump.gpioPin.setState(PinState.LOW)
                    const pumpState = this.#pump.gpioPin.getState()
                    if (pumpState == PinState.LOW) {
                        args.logger.logInfo("Pump turned off succesful.")
                    }
                    else {
                        args.logger.logError("Error turn off pump.")
                    }

                    const delay = this.getSettingsByKey(Settings.pumpStopDelay)?.value ?? 3000
                    await taskDelay(delay)
                }
            }

            args.task.devices?.forEach(device => {
                device.gpioPin.setState(args.state)
                const currentState = device.gpioPin.getState()
                if (currentState != args.state) {
                    args.logger.logError(`Error changing device state: ${device.name}. Current state: ${currentState}`)
                    return
                }

                args.logger.logInfo(`Device: ${device.name} state: ${currentState} after check.`)
            })
        }   

        tasks.forEach(task => {
            periodicTask({
                callback: async () => await taskCallback({ 
                    devices: this.devices, 
                    task: task, 
                    state: PinState.HIGH, 
                    logger: this.#loggerService, 
                    cancellationToken: this.#cancellationToken 
                }),
                isStart: true,
                task: task, 
                cancellationToken: this.#cancellationToken, 
                logger: this.#loggerService
            })
            periodicTask({
                callback: async () => await taskCallback({ 
                    devices: this.devices, 
                    task: task, 
                    state: PinState.LOW, 
                    logger: this.#loggerService, 
                    cancellationToken: this.#cancellationToken 
                }),                     
                isStart: false,
                task: task, 
                cancellationToken: this.#cancellationToken, 
                logger: this.#loggerService
            })
        })
    }

    #isInTaskDeviceWithTheSamePin = task => {
        if (!task.devices) return false
        return task.devices.some(device =>
            task.devices.some(otherDevice =>
                otherDevice.pinNo === device.pinNo && otherDevice.id !== device.id
            )
        )
    }

    #isAnotherWithTheSameName = task => {
        if (!task || !this.#valveTasks) return false
        return this.#valveTasks.some(t =>
            t.name === task.name && t.id !== task.id
        )
    }

    #isTheSameTask = task => {
        if (!task || !this.#valveTasks) return false
        return this.#valveTasks.some(t =>
            t.name === task.name &&
            t.start === task.start &&
            t.stop === task.stop &&
            t.period === task.period &&
            t.isActive === task.isActive &&
            this.#areDevicesSame(t.devices, task.devices)
        )
    }

    #areDevicesSame = (devices1, devices2) => {
        if (!devices1 || !devices2) return false
        return devices1.some(d1 =>
            devices2.some(d2 => d2.name === d1.name && d2.pinNo === d1.pinNo)
        )
    }

    #isDeviceWithTheSameName = device => {
        if (!device)
            return false
        return this.#valves.some(d => d.name == device.name)
    }

    #isDeviceWithTheSamePinNo = device => {
        if (!device)
            return false

        return this.#valves.some(d => d.pinNo == device.pinNo) ||
            this.pump?.pinNo == device.pinNo
    }
    
    #isTheSamePumpPinNo = pinNo => this.#pump.pinNo == pinNo

    #trackScheduler = async func => {
        let result = null
        try {
                result =  await func()
        } catch (e) {
            const message = `Error message: ${e.message}.`
            const stack = `Error stack: ${e.stack}`
            this.#loggerService.logError(message)
            this.#loggerService.logError(stack)

        } finally {
            if (this.#isSchedulerEnabled) {
                this.runScheduler()
            }
            return await result
        }
    }
}