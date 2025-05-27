import { valveTask } from '../models/dbModels/valveTask.js'
import { device } from '../models/dbModels/device.js'
import { dbLog } from '../models/dbModels/dbLog.js'
import { deviceType } from '../models/dbModels/deviceType.js'
import addTask from './addTask.js'
import updateTask from './updateTask.js'
import { settings } from '../models/dbModels/settings.js'
import StatusCode from '../models/StatusCode.js'
import { weatherPrediction } from '../models/dbModels/weatherPrediction.js'
import { Op } from 'sequelize';

export default class AppRepository {

    #dbContext = null
    #loggerService = null

    constructor(dbContext, loggerService) {
        this.#dbContext = dbContext;
        this.#loggerService = loggerService;
    }

    //#region tasks
    getTasks = async () => {
        try {
            await this.#dbContext.ensureCreated()
            const tasks = await valveTask.findAll({
                include: {
                    model: device,
                    as: 'devices',
                    attributes: ['id', 'name', 'pinNo'],
                    include: {
                        model: deviceType,
                        as: 'type'
                    }
                }
            })
            return tasks
        } catch (e) {
            this.#loggerService.logError(e)
            return []
        }
    }

    getTaskById = async id => {
        try {
            await this.#dbContext.ensureCreated()
            return await valveTask.findOne({
                where: {
                    id: id
                },
                include: {
                    model: device,
                    as: 'devices',
                    attributes: ['id', 'name', 'pinNo'],
                    include: {
                        model: deviceType,
                        as: 'type'

                    }
                }
            })
        } catch (e) {
            const message = `GetTaskById returned error: ${e.message}.`
            this.#loggerService.logError(message)
            return {
                isSuccess: false,
                message: message,
                status: StatusCode.InternalServerError
            }
        }
    }

    getTaskByName = async name => {
        try {
            await this.#dbContext.ensureCreated()
            return await valveTask.findOne({
                where: {
                    name: name
                },
                include: {
                    model: device,
                    as: 'devices',
                    attributes: ['id', 'name', 'pinNo'],
                    include: {
                        model: deviceType,
                        as: 'type'
                    }
                }
            })
        } catch (e) {
            const message = `GetTaskByName returned error: ${e.message}`
            this.#loggerService.logError(message)
            return {
                isSuccess: false,
                message: message,
                status: StatusCode.InternalServerError
            }
        }
    }

    addTask = async inputTask =>
        await addTask(inputTask, this.#dbContext, this.#loggerService)

    updateTask = async inputTask =>
        await updateTask(inputTask, this.#dbContext, this.#loggerService)

    deleteTask = async id => {
        try {
            await this.#dbContext.ensureCreated()
            const result = await valveTask.destroy({
                where: {
                    id: id
                }
            })

            if (!result || result == 0) {
                return {
                    isSuccess: false,
                    message: 'No Task was deleted.',
                    status: StatusCode.InternalServerError
                }
            }

            return {
                isSuccess: true,
                message: 'Task deleted successful.',
                status: StatusCode.Ok
            }
        } catch (e) {
            const message = `Delete Task returned error: ${e.message}`
            this.#loggerService.logError(message)
            return {
                isSuccess: false,
                message: message,
                status: StatusCode.InternalServerError
            }
        }
    }

    assignToTask = async (taskId, valveId) => {
        try {
            const task = await valveTask.findByPk(taskId, {
                include: [{
                    model: device,
                    as: 'devices'
                }]
            })
            if (!task)
                return {
                    isSuccess: false,
                    message: `Task id ${taskId} not found.`,
                    status: StatusCode.BadRequest
                }

            const valve = await device.findByPk(valveId)
            if (!valve)
                return {
                    isSuccess: false,
                    message: 'Device to assign not found.',
                    status: StatusCode.BadRequest
                }
            await task.addDevice(valve)
            return {
                isSuccess: true,
                message: 'Device has been assigned to Task.',
                status: StatusCode.Ok
            }

        } catch (e) {
            const message = `Assign device to task returned error: ${e.message}`
            this.#loggerService.logError(message)
            return {
                isSuccess: false,
                message: message,
                status: StatusCode.InternalServerError
            }
        }
    }

    unassignFromTask = async (taskId, valveId) => {
        try {
            const task = await valveTask.findByPk(taskId, {
                include: [{
                    model: device,
                    as: 'devices'
                }]
            })
            if (!task)
                return {
                    isSuccess: false,
                    message: `Task id ${taskId} not found.`,
                    status: StatusCode.BadRequest
                }

            const valve = await device.findByPk(valveId)
            if (!valve)
                return {
                    isSuccess: false,
                    message: 'Device to unassign not found.',
                    status: StatusCode.BadRequest
                }

            await task.removeDevice(valve)
            return {
                isSuccess: true,
                message: 'Device has been unassigned.',
                status: StatusCode.Ok
            }
        } catch (e) {
            const message = `UnassignDevice returned error: ${e.message}`
            this.#loggerService.logError(message)
            return {
                isSuccess: false,
                message: message,
                status: StatusCode.InternalServerError
            }
        }
    }
    //#endregion
    //#region devices
    getDevices = async () => {
        try {
            await this.#dbContext.ensureCreated()
            const tasks = await device.findAll({
                include: [{
                    model: deviceType,
                    as: 'type'
                }]
            })
            return tasks
        } catch (e) {
            this.#loggerService.logError(e)
            return []
        }
    }

    getDeviceById = async id => {
        await this.#dbContext.ensureCreated()
        return await device.findOne({
            where: {
                id: id
            },
            include: [{
                model: deviceType,
                as: 'type'
            }]
        })
    }

    getDeviceByName = async name => {
        try {
            await this.#dbContext.ensureCreated()
            return await device.findOne({
                where: { name: name },
                include: [{
                    model: deviceType,
                    as: 'type'
                }]
            })
        } catch (e) {
            this.#loggerService.logError(`getDeviceByName error: ${e.message}`)
            this.#loggerService.logError(`getDeviceByName error: ${e.stack}`)
            return null;
        }
    }

    addDevice = async inputDevice => {
        try {
            await this.#dbContext.ensureCreated()
            const inputType = await deviceType.findOne({
                where: {
                    name: inputDevice.type
                }
            })

            const deviceResult = await device.create({
                ...inputDevice,
                deviceTypeId: inputType.id
            })

            const newDevice = await device.findOne({
                where: {
                    id: deviceResult.id
                },
                include: [{
                    model: deviceType,
                    as: 'type'
                }]
            })
            return {
                isSuccess: true,
                result: newDevice,
                status: StatusCode.Created
            }
        } catch (e) {
            const message = `AddDevice returned error: ${e.message}`
            this.#loggerService.logError(e)
            return {
                isSuccess: false,
                message: message,
                status: StatusCode.InternalServerError
            }
        }
    }

    updateDevice = async inputDevice => {
        try {
            await this.#dbContext.ensureCreated()

            const currentDevice = device.findByPk(inputDevice.id)
            const formatedInputDevice = {}

            if (currentDevice.name != inputDevice.name) {
                formatedInputDevice.name = inputDevice.name
            }

            if (currentDevice.pinNo != inputDevice.pinNo) {
                formatedInputDevice.pinNo = inputDevice.pinNo
            }

            const result = await device.update(formatedInputDevice, {
                where: {
                    id: inputDevice.id
                }
            })
            if (!result || result == 0) {
                return {
                    isSuccess: false,
                    message: 'No device was updated.',
                    status: StatusCode.InternalServerError
                }
            }

            return {
                isSuccess: true,
                message: 'Device updated successful.',
                status: StatusCode.Ok
            }
        } catch (e) {
            const message = `Update device returned error: ${e.message}`
            this.#loggerService.logError(e)
            return {
                isSuccess: false,
                message: message,
                status: StatusCode.InternalServerError
            }
        }
    }

    deleteDevice = async id => {
        try {
            await this.#dbContext.ensureCreated()
            const result = await device.destroy({
                where: {
                    id: id
                }
            })

            if (!result || result == 0) {
                return {
                    isSuccess: false,
                    message: 'No device was deleted.',
                    status: StatusCode.InternalServerError
                }
            }

            return {
                isSuccess: true,
                message: 'Device deleted successful.',
                status: StatusCode.Ok
            }
        } catch (e) {
            const message = `Delete Device returned error: ${e.message}`
            this.#loggerService.logError(message)
            return {
                isSuccess: false,
                message: message,
                status: StatusCode.InternalServerError
            }
        }
    }
    //#endregion
    //#region logToDb
    logToDb = async log => {
        try {
            await this.#dbContext.ensureCreated();
            const logEntry = {
                message: log.message || log.toString(),
                level: log.level || 'INFO',
                timestamp: new Date()
            };
            return await dbLog.create(logEntry);
        } catch (e) {
            this.#loggerService.logError(`Logging to database returned error: ${e.message}`);
            return null;
        }
    }

    getLogs = async () => {
        try {
            await this.#dbContext.ensureCreated()
            return await dbLog.findAll()
        } catch (e) {
            this.#loggerService.logError(`Get settings returned error: ${e.message}`)
            return null
        }
    }
    //#endregion
    //#region settings
    getSettings = async () => {
        try {
            await this.#dbContext.ensureCreated()
            return await settings.findAll()
        } catch (e) {
            this.#loggerService.logError(`Get settings returned error: ${e.message}`)
            return null
        }
    }

    getSettingsByKey = async key => {
        try {
            await this.#dbContext.ensureCreated()
            return await settings.findOne({
                where: {
                    key: key
                }
            })
        } catch (e) {
            this.loggerService.logError(`Get settingsBy key returned error: ${e.message}`)
            return null
        }
    }

    updateSettingsValue = async (key, value) => {
        try {
            await this.#dbContext.ensureCreated()
            const settingResult = await settings.findOne({
                where: {
                    key: key
                }
            })

            if (!settingResult)
                return {
                    isSuccess: false,
                    message: 'This key not exists.',
                    status: StatusCode.BadRequest
                }

            settingResult.value = value
            const updateResult = await settings.update({
                id: settingResult.id,
                key: key,
                value: value
            },
                {
                    where: {
                        key: key
                    }
                }
            )
            if (!updateResult || updateResult == 0)
                return {
                    isSuccess: false,
                    message: 'Update settings value failed.',
                    status: StatusCode.InternalServerError
                }

            return {
                isSuccess: true,
                result: settingResult,
                status: StatusCode.Ok
            }
        } catch (e) {
            const message = `Update settings by key faild: ${e.message}`
            this.#loggerService.logError(message)
            return {
                message: message,
                status: StatusCode.InternalServerError,
                isSuccess: false
            }
        }
    }
    //#endregion
    //#region deviceTypes
    async getDeviceTypes() {
        try {
            await this.#dbContext.ensureCreated()
            deviceType.findAll()
        } catch (e) {
            const message = `Get Device types error: ${e.message}`
            this.#loggerService.logError(message)
            return { isSuccess: false, message: message }
        }
    }
    //#enddregion 
    //#region weatherPrediction
    addWeatherPrediction = async inputPrediction => {
        try {
            await this.#dbContext.ensureCreated()

            const weatherPredictionResult = await weatherPrediction.create(inputPrediction)

            return {
                isSuccess: true,
                result: weatherPredictionResult,
                status: StatusCode.Created
            }
        } catch (e) {
            const message = `AddWeatherPrediction returned error: ${e.message}`
            this.#loggerService.logError(e)
            return {
                isSuccess: false,
                message: message,
                status: StatusCode.InternalServerError
            }
        }
    }

    isDailyPrediction = async () => {
        try {
            await this.#dbContext.ensureCreated()
            const today = new Date()
            today.setHours(0, 0, 0, 0)
        
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            const prediction = await weatherPrediction.findOne({
                where: {
                    date: {
                        [Op.between]: [today, tomorrow]
                    }
                }
            })

            return {
                isSuccess: true,
                result: prediction != null,
                status: StatusCode.Ok
            }
        } catch (e) {
            const message = `isDailyPrediction returned error: ${e.message}`
            this.#loggerService.logError(e)
            return {
                isSuccess: false,
                message: message,
                status: StatusCode.InternalServerError
            }
        }
    }
    //#region

    #simpleCatchError = async (func, errorMessage) => {
        try {
            return await func()
        }
        catch (e) {
            const message = `${errorMessage} returned error: ${e.message}`
            this.#loggerService.logError(message)
            return {
                isSuccess: false,
                message: message,
                status: StatusCode.InternalServerError
            }
        }
    }
}