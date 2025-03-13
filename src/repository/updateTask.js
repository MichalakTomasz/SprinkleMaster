import { formatTime } from '../helpers/dateHelper.js'
import { valveTask } from '../models/dbModels/valveTask.js'
import { device } from '../models/dbModels/device.js'
import { deviceType } from '../models/dbModels/deviceType.js'
import StatusCode from '../models/StatusCode.js'

const updateTask = async (inputTask, dbContext, loggerService) => {
    await dbContext.ensureCreated()
    try {
        return await dbContext.sequelize.transaction(async t => {
            
            const existingTask = await valveTask.findByPk(inputTask.id, { transaction: t })
            if (!existingTask) {
                throw new Error('Task not found')
            }  

            let inputJson = {
                start: formatTime(inputTask.start),
                stop: formatTime(inputTask.stop),
                period: inputTask.period,
                isActive: inputTask.isActive
            }

            if (inputTask.name != existingTask.name)
                existingTask.name = inputTask.name

            await existingTask.update(inputJson, {
                transaction: t
            })

            const updatedTask = await valveTask.findByPk(inputTask.id, {
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
                result: updatedTask,
                status: StatusCode.Ok
            }
        })
    } catch (e) {
        const message = `UpdateTask returned error: ${e.message}`
        loggerService.logError(message)
        loggerService.logError(JSON.stringify(e))
        return {
            isSuccess: false,
            message: message,
            status: StatusCode.InternalServerError
        }
    }
}

export default updateTask