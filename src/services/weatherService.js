import getLocation from './gpsService.js'
import fetch from 'node-fetch'
import fs from 'fs'

const isToday = (date) => {
    if (!date)
        return false
    const dateObj = new Date(date)
    const now = new Date()
    return dateObj.getDate() == now.getDate() && 
    dateObj.getMonth() == now.getMonth() && 
    dateObj.getFullYear() == now.getFullYear()
}

const utf8 = 'utf8'
 const saveWeatherPrediction = (path, weatherPrediction)  => {
    if (!path || !weatherPrediction)
        return
    try {
        fs.writeFileSync(path, JSON.stringify(weatherPrediction), utf8)
    }
    catch (e) {
        return
    }    
 }        

const readWeatherPrediction = path => 
{
    try {
        const fileContent =  fs.readFileSync(path, utf8)
        if (!fileContent)
            return null

        const prediction = JSON.parse(fileContent)
        const dateString = prediction?.weatherPrediction?.hourly?.time[0]
        const date = new Date(dateString)
        if (!date || !isToday(date))
            return

        return prediction
    }
    catch (e) {
        return null
    }
}

export const checkCurrentWeather = async args => {
    const weatherAssistantFile = 'weatherAssistant.json'
    const prediction = readWeatherPrediction('./' + weatherAssistantFile)  
    
    if (prediction?.weatherPrediction && prediction?.location && isToday(prediction?.date)) {
        return prediction
    }

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

        const predictionresult = {
            weatherPrediction: jsonResult,
            location: location,
            date: new Date()
        }
        saveWeatherPrediction('./' + weatherAssistantFile, predictionresult)

        return  predictionresult
    } catch (e) {
        args?.logger.logError(`Weather API error: ${e.message}.`)
    }
}

export const shouldWater = async args => {
    const { weatherPrediction, location } = await checkCurrentWeather(args)
    const predictionSum = weatherPrediction?.hourly?.rain?.reduce((a, c) => a + c, 0)
    const isWaterNeeded = predictionSum <= 4

    if (!(await args.repository.isDailyPrediction())?.result ) {
        await args.repository.addWeatherPrediction({ rain: predictionSum })
    }
    
    args?.logger.logInfo(`Daily rain prediction: ${predictionSum} mm/m2.`)
    if (isWaterNeeded) {
        args?.logger.logInfo('Watering is needed.')
    } else {
        args?.logger.logInfo('Watering is not needed.')
    }

    return isWaterNeeded
}