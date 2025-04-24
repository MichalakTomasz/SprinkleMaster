import getLocation from './gpsService.js'
import fetch from 'node-fetch'

export const checkCurrentWeather = async () => {  
    const location = await getLocation()
    if (!location) {
        console.error('Get location error.')
        return
    } 
    try {
        const url = 'https://api.open-meteo.com'
        const weatherQuery = `${url}/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=rain&timezone=auto&forecast_days=1`
        const result = await fetch(weatherQuery)
        
        return result.json()
    } catch (e) {

    }
}

export const shouldWater = async () => {
    const prediction = await checkCurrentWeather()
    return prediction?.hourly?.rain?.reduce((a, c) => a + c, 0) < 10
}