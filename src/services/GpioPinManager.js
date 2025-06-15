import pigpio from 'pigpio'
import { isGpioCommonPin, convertPinState } from '../helpers/pinHelper.js'
import container from '../container/container.js'
import PinState from '../models/PinState.js'

let isPigpioInitialized = false

export default class GpioPin {
    #pinNo
    #pin = null
    #loggerService

    constructor(pinNo, init = false) {

        this.#loggerService = container.resolve('loggerService')

        if (!isGpioCommonPin(pinNo)) {
            this.#loggerService.logError(`Pin ${pinNo} is not for common use.`)
            return
        }
        
        this.#pinNo = pinNo
        if (init) {
            this.#ensureCreated()
        }
    }

    setState = state => {
        try {
            this.#ensureCreated()
            this.#pin.digitalWrite(convertPinState(state))
            this.#loggerService.logDebug(`Pin ${this.#pinNo} state changed to ${state}`)
        } catch (e) {
            this.#loggerService.logError(e.message)
        }        
    }

    getState = () => {
        try {
            this.#ensureCreated()
            const state = this.#pin.digitalRead()
            return convertPinState(state)
        } catch (e) {
            this.#loggerService.logError(e.message)
            return null
        } 
    }

    getPinNo = () => this.#pinNo

    destroy = () => { 
        this.#pin?.digitalWrite(convertPinState(PinState.LOW))
        this.#pin = null
        this.#loggerService.logInfo(`Pin ${this.#pinNo} deactivated.`)
     }

    #ensureCreated = () => {
        if (!this.#pin) {
            try {
                if (!isPigpioInitialized) {
                    pigpio.initialize()
                    isPigpioInitialized = true
                    this.#loggerService.logInfo('Pigpio initialized successfully')
                }
    
                this.#pin = new pigpio.Gpio(this.#pinNo, { 
                    mode: pigpio.Gpio.OUTPUT
                })

                this.#pin.digitalWrite(convertPinState(PinState.LOW))
                
                this.#loggerService.logInfo(`Pin ${this.#pinNo} activated.`)
            } catch (e) {
                this.#loggerService.logError(`Gpio initializer returns error: ${e.message}`)
            } 
        }
    }
}