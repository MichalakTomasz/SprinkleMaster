import { CreateClientDevice, CreateServerDevice } from './deviceHelper.js'

export const CreateClientTask = task => ({
    id: task.id, 
    name:task.name, 
    start: task.start, 
    stop: task.stop, 
    period: task.period,
    isActive: task.isActive,
    devices: task.devices?.map(d => CreateClientDevice(d))
})

export const CreateServerTask = task => {
    return {
        id: task.id, 
        name: task.name, 
        start: task.start, 
        stop: task.stop, 
        period: task.period,
        isActive: task.isActive,
        devices: task.devices?.map(d => CreateServerDevice(d))
    }    
}