import getLocation from './gpsService.js'
import fetch from 'node-fetch'

export const checkCurrentWeather = async args => {  
    const location = await getLocation()
    if (!location) {
        args?.logger.logError('Get location error.')
        return
    } 
    try {
        const url = 'https://api.open-meteo.com'
        const weatherQuery = `${url}/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=rain&timezone=auto&forecast_days=1`
        const result = await fetch(weatherQuery)
        
        const jsonResult = await result.json()
        args?.logger.logInfo(`Weather API response: ${JSON.stringify(jsonResult)}`)

        return jsonResult
    } catch (e) {
        args?.logger.logError(`Weather API error: ${e.message}.`)
    }
}

export const shouldWater = async args => {
    const prediction = await checkCurrentWeather(args)
    const predictionSum = prediction?.hourly?.rain?.reduce((a, c) => a + c, 0)
    const isWaterNeeded = predictionSum <= 4
    
    args?.logger.logInfo(`Rain day prediction: ${predictionSum} mm/m2.`)
    if (isWaterNeeded) {
        args?.logger.logInfo('Watering is needed.')
    } else {
        args?.logger.logInfo('Watering is not needed.')
    }

    return isWaterNeeded
}