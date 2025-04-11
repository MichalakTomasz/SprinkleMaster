import { convertPinState } from "../helpers/pinHelper.js"
import PinState from "../models/PinState.js"

export default class GpioPinMock {
    #pinNo
    #state = null

    constructor(pinNo, connect = false) { 
        this.#pinNo = pinNo
        this.#state= convertPinState(PinState.LOW)
    }

    setState = (state) => {
        this.#state = convertPinState(state)
    }
    getState = () => convertPinState(this.#state)
    getPinNo = () => this.#pinNo
    init = () => {}
    destroy = () => {}
}