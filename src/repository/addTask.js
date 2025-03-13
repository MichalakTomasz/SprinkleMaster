import { formatTime } from '../helpers/dateHelper.js'
import { valveTask } from "../models/dbModels/valveTask.js"
import { device } from "../models/dbModels/device.js"
import { deviceType } from "../models/dbModels/deviceType.js"
import StatusCode from '../models/StatusCode.js'
  
const addTask = async (inputTask, dbContext, loggerService) => {
    await dbContext.ensureCreated()
    try {
        return await dbContext.sequelize.transaction(async t => {

            const createdTask = await valveTask.create({
                name: inputTask.name,
                start: inputTask.start ? formatTime(inputTask.start) : null,
                stop: inputTask.stop ? formatTime(inputTask.stop) : null,
                period: inputTask.period,
                isActive: inputTask.isActive
            }, {
                transaction: t
            })

            const addedTask = await valveTask.findByPk(createdTask.id, {
                include: [{
                    model: device,
                    as: 'devices',
                    include: [{
                        model: deviceType,
                        as: 'type'
                    }]
                }],
                transaction: t
            })
            return {
                isSuccess: true,
                result: addedTask,
                status: StatusCode.Created
            }
        })

    } catch (e) {
        const message = `AddTask returned error: ${e.message}`
        loggerService.logError(message)
        loggerService.logError(JSON.stringify(e))
        return {
            isSuccess: false,
            message: message,
            status: StatusCode.InternalServerError
        }
    }
}

export default addTask