import { convertPinState } from "../helpers/pinHelper.js"

export default class GpioPinMock {
    #pinNo
    #state = null

    constructor(pinNo, connect = false) { 
        this.#pinNo = pinNo
    }

    setState = (state) => {
        this.#state = convertPinState(state)
    }
    getState = () => convertPinState(this.#state)
    getPinNo = () => this.#pinNo
    init = () => {}
    destroy = () => {}
}