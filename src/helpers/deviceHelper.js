import GpioPin from '../services/GpioPinManager.js'
import container from '../container/container.js'
import GpioPinMock from '../services/GpioPinMock.js'

export const CreateServerDevice = device => {
    const isGpioMock = container.resolve('configurationService').getConfig().isGpioMock
    return {
        id: device.id,
        name: device.name,
        pinNo: device.pinNo,
        type : device.type.name,
        gpioPin: isGpioMock? new GpioPinMock(device.pinNo) : new GpioPin(device.pinNo)
    }
}

export const UpdateServerDevice = (baseDeivce, deviceChanges) => {
    const isGpioMock = container.resolve('configurationService').getConfig().isGpioMock
    baseDeivce.name = deviceChanges.name
    baseDeivce.type = deviceChanges.type
    if (baseDeivce.pinNo != deviceChanges.pinNo) {
        baseDeivce.pinNo = deviceChanges.pinNo
        baseDeivce.gpioPin.destroy()
        baseDeivce.gpioPin = isGpioMock ? 
            new GpioPinMock(deviceChanges.pinNo) : 
            new GpioPin(deviceChanges.pinNo)
    }
}

export const CreateClientDevice = device => ({
    id: device.id,
    name: device.name,
    pinNo: device.pinNo,
    type: device.type,
    state: device.gpioPin.getState()
})