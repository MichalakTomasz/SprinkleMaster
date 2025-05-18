import { convertPinState } from "../helpers/pinHelper.js"
import PinState from "../models/PinState.js"
import { Gpio } from 'onoff'

export default class GpioOnOff {
    #pinNo
    #gpio

    constructor(pinNo, connect = false) { 
        this.#pinNo = pinNo
        this.#gpio = new Gpio.Gpio(pinNo, 'out')
        this.setState(PinState.LOW)
    }

    setState = (state) => {
        this.#gpio.writeSync(convertPinState(state))
    }
    getState = () => convertPinState(this.#gpio.readSync())
    getPinNo = () => this.#pinNo
    init = () => {}
    destroy = () => {
        this.#gpio.unexport()
        this.#pinNo = null
    }
}