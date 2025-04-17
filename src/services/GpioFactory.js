import GpioPinMock from './GpioPinMock.js'
import GpioPin from './GpioPinManager.js'

export default class GpioFactory {
    #configurationService
    
    constructor(configurationService) {
        this.#configurationService = configurationService
    }

    createGpioPin(pinNo) {
        const isGpioMock = this.#configurationService.getConfig().isGpioMock
        return isGpioMock ? new GpioPinMock(pinNo) : new GpioPin(pinNo)
    }
}