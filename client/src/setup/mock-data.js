import Period from '../models/Period.js'
import PinState from '../models/PinState.js'

export const pump = {
        id: 5,
        type: 'PUMP',
        pinNo: 6,
        state: PinState.HIGH
    }

export const tasks = [
    {
        id: 1,
        name: 'sekcja tył',
        state: PinState.LOW,
        start: '06:00',
        stop: '07:00',
        period: Period.EVERYDAY,
        isActive: true
    },
    {
        id: 2,
        name: 'sekcja przód',
        state: PinState.LOW,
        start: '07:00',
        stop: '08:00',
        period: Period.EVERYDAY,
        isActive: true
    }
]

export const valves = [
    {
        id: 1,
        name: 'zawór-1',
        pinNo: 5,
        state: PinState.LOW
    },
    {
        id: 2,
        name: 'zawór-2',
        pinNo: 20,
        state: PinState.LOW
    },
    {
        id: 3,
        name: 'zawór-3',
        pinNo: 21,
        state: PinState.LOW
    },
    {
        id: 4,
        name: 'zawór-4',
        pinNo: 22,
        state: PinState.LOW
    }
]


