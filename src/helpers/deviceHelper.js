import container from '../container/container.js'

export const CreateServerDevice = device => {
    const gpioFactory = container.resolve('gpioFactory')
    return {
        id: device.id,
        name: device.name,
        pinNo: device.pinNo,
        type : device.type.name,
        gpioPin: gpioFactory.createGpioPin(device.pinNo)
    }
}

export const UpdateServerDevice = (baseDeivce, deviceChanges) => {
    const gpioFactory = container.resolve('gpioFactory')
    baseDeivce.name = deviceChanges.name
    baseDeivce.type = deviceChanges.type
    if (baseDeivce.pinNo != deviceChanges.pinNo) {
        baseDeivce.pinNo = deviceChanges.pinNo
        baseDeivce.gpioPin.destroy()
        baseDeivce.gpioPin = gpioFactory.createGpioPin(deviceChanges.pinNo)
    }
}

export const CreateClientDevice = device => ({
    id: device.id,
    name: device.name,
    pinNo: device.pinNo,
    type: device.type,
    state: device.gpioPin.getState()
})