import PinState from '../models/PinState.js'

export const convertPinState = state => {
    switch (state) {
        case PinState.UNDEFINED:
            return 0
        case PinState.HIGH:
            return 1
        case PinState.LOW:
            return 0
        case 1:
            return PinState.HIGH
        case 0:
            return PinState.LOW
        case null:
            return PinState.UNDEFINED
        case true:
            return 1
        case false:
            return 0
        default:
            return 0
    }
}

//Gpio pins for raspberry models: Model A+, B+, Pi Zero, Pi Zero W, Pi2B, Pi3B, Pi4B
/*
      GPIO pin pin GPIO	
3V3	    -	1	2	-	5V
SDA	    2	3	4	-	5V
SCL	    3	5	6	-	Ground
        4	7	8	14	TXD
Ground	-	9	10	15	RXD
ce1	    17	11	12	18	ce0
        27	13	14	-	Ground
        22	15	16	23	
3V3	    -   17	18	24	
MOSI	10	19	20	-	Ground
MISO	9	21	22	25	
SCLK	11	23	24	8	CE0
Ground	-	25	26	7	CE1
ID_SD	0	27	28	1	ID_SC
        5	29	30	-	Ground
        6	31	32	12	
        13	33	34	-	Ground
miso	19	35	36	16	ce2
        26	37	38	20	mosi
Ground	-	39	40	21	sclk

->  bottom USB ETHERNET  <- 
*/
export const isGpioCommonPin = pin => {
    const gpioPins = [4, 17, 27, 22, 5, 6, 13, 26, 
                                23, 24, 25, 12]
                                
    return gpioPins.includes(Number.parseInt(pin))
}