import express from "express"
import { validationResult, body, check } from 'express-validator'
import { CreateClientTask } from '../helpers/taskHelper.js'
import { CreateClientDevice } from "../helpers/deviceHelper.js"
import container from '../container/container.js'
import StatusCode from "../models/StatusCode.js"
import { isGpioCommonPin } from "../helpers/pinHelper.js"

const taskManager = container.resolve('taskManager')
const router = express.Router()

const internalServerError = "Internal server error."
const valveNameRequired = 'Valve name is required.'
const pinNoRequired = 'Pin no is required.'
const typeMustBeVavle = 'Type must be "VALVE" type.'

const Valve = 'VALVE'
const Pump = 'PUMP'

//#region task
//Get all Tasks
router.get("/task/", (req, res) => {
  const getResult = taskManager.getTasks()

  const tasks = getResult.result?.map(t => CreateClientTask(t))
  
  return res.status(getResult.status).json(tasks)
})

//Get Taks by id
router.get('/task/getById/:id', [
  check('id').notEmpty().isString().withMessage('Parmam "id" can not be empty.')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSuccess: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}.`
    })
  const id = req.params.id
  const result = taskManager.getTaskById(id)
  if (!result.isSuccess) 
    return res.status(result.status).json(result)

  return res.status(result.status).json(CreateClientTask(result.result))
})

//Get Task by Name
router.get("/task/getByName/:name", [
  check('name').notEmpty().isString().withMessage('Parmam "name" can not be empty.')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSuccess: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}.`
    })

  const name = req.params.name

  const result = taskManager.getTaskByName(name)
  if (!result.isSuccess) 
    return res.status(result.status).json(result)

  res.send(CreateClientTask(result.result))
})

/* Example body to properly insert task to database:
{
    "name": "S 3",
    "start": "11:00",
    "stop": "12:00",
    "period": "EVERYDAY",
    "isActive": false
}   
*/
//Add Task
router.post("/task/", [
  body('name').isString().notEmpty().withMessage('Param "name" can not be empty.'),
  body('start').notEmpty().isString().withMessage('Param "start" can not be empty.'),
  body('stop').notEmpty().isString().withMessage('Param "stop" can not be empty.'),
  body('period').notEmpty().isString().withMessage('Param "period" can not be empty.'),
  body('isActive').notEmpty().isBoolean().withMessage('Param "isActive" can not be empty.')
], async (req, res) => {
  
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSuccess: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}.`
    })

  const newTask = req.body

  const result = await taskManager.addTask(newTask)
  if (!result.isSuccess)
    return res.status(result.status).json(result)

  return res.status(result.status).json(CreateClientTask(result.result))
})

//Update Task
router.patch("/task/", [
  body('id').isInt().notEmpty().withMessage('Param "id" can not be empty.'),
  body('name').isString().notEmpty().withMessage('Param "name" can not be empty.'),
  body('start').notEmpty().isString().withMessage('Param "start" can not be empty.'),
  body('stop').notEmpty().isString().withMessage('Param "stop" can not be empty.'),
  body('period').notEmpty().isString().withMessage('Param "period" can not be empty.'),
  body('isActive').notEmpty().isBoolean().withMessage('Param "isActive" can not be empty.')
], async (req, res) => {
  
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSuccess: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}.`
    })

  const taskToUpdate = req.body

  const result = await taskManager.updateTask(taskToUpdate)
  if (!result.isSuccess)
    return res.status(result.status).json(result)

  return res.status(result.status).json(CreateClientTask(result.result))
})

//Delete Task
router.delete('/task/:id', [
  check('id').isInt().notEmpty().withMessage('Param "Id" can not be empty.')
], async (req, res) => {
  
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSuccess: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}.`
    })

  const id = req.params.id
  
  const result = await taskManager.deleteTask(id)
  res.send(result)
})

/*
{
  taskId: 4,
  valveId: 3
}
*/
//Assign Valve to Task
router.post('/task/assign', [
  body('taskId').isInt().notEmpty().withMessage('Param "taskId" can not be empty.'),
  body('valveId').isInt().notEmpty().withMessage('Param "valveId" can not be empty.')
], async (req, res) => {
  
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSuccess: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}.`
    })

    const taskId = req.body.taskId
    const valveId = req.body.valveId
    const assignResult = await taskManager.assignToTask(taskId, valveId)
    
    return res.status(assignResult.status).json(assignResult)
})

/*
{
  taskId: 4,
  valveId: 3
}
*/
//Unassign Valve from task
router.post('/task/unassign', [
  body('taskId').isInt().notEmpty().withMessage('TaskId can not be empty.'),
  body('valveId').isInt().notEmpty().withMessage('ValveId can not be empty.')
], async (req, res) => {
 
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSuccess: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}.`
    })

    const taskId = req.body.taskId
    const valveId = req.body.valveId
    const assignResult = await taskManager.unassignFromTask(taskId, valveId)
    
    return res.status(assignResult.status).json(assignResult)
})

/*
{
  "id": 4,
  "state: "LOW"
}
*/

//Open or close all Valves of Task
router.post('/task/state', [
  body('id').isInt().withMessage('Id must be int.')
  .notEmpty().withMessage('Valve id is required.'),
  body('state').isString().withMessage('state must be string.')
  .toUpperCase().isIn(['HIGH', 'LOW']).withMessage('Pin state must be set: "HIGH" or "LOW')], 
  async (req, res) => {
  
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSuccess: false, 
      messagee: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}.` })

  const id = req.body.id
  const state = req.body.state

  const changeStateResult = await taskManager.changeTaskStates(id, state)

  return res.status(changeStateResult.status).json(changeStateResult)
})

//Shut the Pump down and close every valves in tasks.
router.post('/closeAll', async (req, res) => {
  const closeAllResult = await taskManager.closeAllValves()
  
  return res.status(closeAllResult.status).json(closeAllResult)
})
//#endregion

//#region pump
//Get Pump
router.get('/pump', (req, res) => {
  const pumpResult = taskManager.getPump()

  return res.status(pumpResult.status).json(pumpResult)
})

/*
{
  "pinNo": 5
}
*/
//Add Pump
router.post('/pump', [
  body('pinNo').isInt().notEmpty().withMessage('Field pinNo can not be empty.')
  .custom((value) => {
    if (isGpioCommonPin(value))
      return true
    else {
      throw new Error(`Gpio pin ${value} is no gpio pin for common use.`)
    }
  })
], async (req, res) => {
  
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSucces: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}`,
    })

  const pinNo = req.body.pinNo
  
  const addPumpResult = await taskManager.addPump(pinNo)
  
  return res.status(addPumpResult.status).json(addPumpResult)
})


/*
{
  "pinNo": 5
}
*/
//Edit Pump
router.patch('/pump', [
  body('pinNo').isInt().notEmpty().withMessage('Param pinNo can not be empty.')
  .custom(value => {
    if (isGpioCommonPin(value))
      return true
    else {
      throw new Error(`Gpio pin ${value} is not for common use.`)
    }
  })
], async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSucces: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}`,
    })

  const changePumpPinNoResult = await taskManager.changePumpPinNo(pinNo)
  
  return res.status(changePumpPinNoResult.status).json(changePumpPinNoResult)
})

//Delete Pump
router.delete('/pump', async (req, res) => {
  const deletePumpResult = await taskManager.deletePump()
  
  return res.status(deletePumpResult.status).json(deletePumpResult)
})
//#endregion

//#region Valve
//Get Valves
router.get('/valve', (req, res) => {
  const getValvesResult = taskManager.getValves()
  const valves = getValvesResult.result.map(v => CreateClientDevice(v))

  return res.status(getValvesResult.status).json(valves)
})

/*
{
  "name": "zawor-1",
  "pinNo": 27
}
*/
//Add Valve
router.post('/valve',[
  body('name').notEmpty().isString().withMessage(valveNameRequired),
  body('pinNo').isInt().notEmpty().withMessage(pinNoRequired)
  .custom((value) => {
    if (isGpioCommonPin(value))
      return true
    else {
      throw new Error(`Gpio pin ${value} is not for common use.`)
    }
  })
], async (req, res) => {
  
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSucces: false,
      message: `BadRequest: ${errors.array().map(e => e.msg).join(', ')}.`,
      status: StatusCode.BadRequest
      })
    
  const valve = req.body
  const addResult = await taskManager.addValve(valve)
  if (!addResult.isSuccess)
    return res.status(addResult.status).json(addResult)

  const clientValve = CreateClientDevice(addResult.result)

  return res.status(addResult.status).json(clientValve)
})

//Update Valve
router.patch('/valve', [
  body('id').isInt().notEmpty().withMessage('Id is required.'),
  body('name').isString().withMessage(valveNameRequired),
  body('pinNo').isInt().withMessage(pinNoRequired)
  .custom((value) => {
    if (isGpioCommonPin(value))
      return true
    else {
      throw new Error(`Gpio pin ${value} is not for common use.`)
    }
  }),
  body('type').equals(Valve).withMessage(typeMustBeVavle)
], async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
    isSucces: false,
    message: `BadRequest: ${errors.array().map(e => e.msg).join(', ')}.`,
    status: StatusCode.BadRequest
    })
  
  const valve = req.body
  const updateResult = await taskManager.updateValve(valve)

  return res.status(updateResult.status).json(updateResult)
})

//Delete Valve
router.delete('/valve/:id', [
  check('id').notEmpty().isInt().withMessage('Id can not be empty.')
  ],
  async (req, res) => {
    
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(StatusCode.BadRequest).json({ 
        isSuccess: false,
        message: `Bad request: ${errors.array().map(e => e.msg).join(', ')}`,
        status: StatusCode.BadRequest
      })

    const id = req.params.id
    const deleteResult = await taskManager.deleteValve(id)
      return res.status(deleteResult.status).json(deleteResult)
  })

//Get current state of the Valve
router.get('/valve/state/:id', [
  check('id').notEmpty().isInt().withMessage('Valve id can not be empty.')
], (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSuccess: false,
      message: `Validetion error: ${errors.array().map(e => e.msg).join(', ')}.`,
      status: StatusCode.BadRequest
    })

  const id = req.params.id
  const result = taskManager.getValveState(id)
    
  return res.status(result.status).json(result)
})

//Search every registered devices for pin no and get state
router.get('/state/:pinNo', [
  check('pinNo').notEmpty().isInt().withMessage('Pin No can not be empty.')
], (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty())
    return {
      isSuccess: false,
      message: `Validetion error: ${errors.array().map(e => e.msg).join(', ')}.`,
      status: StatusCode.BadRequest
    }

  const pinNo = req.params.pinNo
  const result = taskManager.getPinState(pinNo)
    
  return res.status(result.status).json(result)
})
//#endregion

/*
{
  "valveId": 5
  "state": 'HIGH'
}
*/
//Open or close Valve  states: HIGH, LOW
router.post('/valve/state', [
  body('id').isInt().withMessage('Id must be int.')
  .notEmpty().withMessage('Valve id is required.'),
  body('state').isString().withMessage('state must be string.')
  .toUpperCase().isIn(['HIGH', 'LOW']).withMessage('Pin state must be set: "HIGH" or "LOW')
], async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSucces: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}`,
      status: StatusCode.BadRequest
    })

  const id = req.body.id
  const state = req.body.state
     
  const valveChangeStateResult = await taskManager.changeValveState(id, state)
  
  return res.status(valveChangeStateResult.status).json(valveChangeStateResult)
})
//#endregion

//#region scheduler

//Get if Scheduler is enabled
router.get('/isSchedulerEnabled', (req, res) => {
  const isSchedulerEnabled = taskManager.getIsSchedulerEnabled()
  return res.status(StatusCode.Ok).json({
    message: isSchedulerEnabled ? 'Scheduler is enabled.' : 'Scheduler is disabled.',
    result: isSchedulerEnabled,
    status: StatusCode.Ok
  })
})

//Run Scheduler
router.post('/runScheduler', (req, res) => {
  const result = taskManager.runScheduler()
  if (result) {
    return res.status(StatusCode.Ok).json({
      message: 'Scheduler has been started.',
      isEnabled: true,
    })
  } else {
    return res.status(StatusCode.InternalServerError).json({
      message: internalServerError,
      isEnabled: false,
    })
  }
})

//Stop Scheduler
router.post('/stopScheduler', (req, res) => {
  const result = taskManager.stopScheduler()
  if (result) {
    return res.status(StatusCode.Ok).json({
      message: 'Scheduler has been stopped.',
      isEnabled: false,
    })
  } else {
    res.status(StatusCode.InternalServerError).json({
      message: internalServerError,
      isEnabled: undefined,
    })
  }
})
//#endregion

//#region settings
//Get Settings
router.get('/settings', (req, res) => {
  const settingResult = taskManager.getSettings()

  return res.status(settingResult.status).json(settingResult)
})

//Get setting by key
router.get('/settings/byKey/:key', [
  check('key').isString().notEmpty().withMessage('Param "key" can not be empty.')
], (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSucces: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}`,
      status: StatusCode.BadRequest
    })

  const key = req.params?.key
  
  const settingResult = taskManager.getSettingsByKey(key)

  return res.status(settingResult.status).json(settingResult)
})

/*
{
  "key": 'pumpStopDelay',
  "value": 3000
}
*/
//Upddate setting
router.patch('/settings', [
  body('key').isString().notEmpty().withMessage('Param "key" can not be empty.'),
  body('value').isString().notEmpty().withMessage('Param "value" can not be empty.')
], async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(StatusCode.BadRequest).json({
      isSucces: false,
      message: `Validation errors: ${errors.array().map(e => e.msg).join(', ')}`,
      status: StatusCode.BadRequest
    })

  const key = req.body.key
  const value = req.body.value
  const settingsResult = await taskManager.updateSettingsValue(key, value)

  return res.status(settingsResult.status).json(settingsResult)
})
//endregion

export default router
