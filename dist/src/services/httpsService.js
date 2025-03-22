import https from 'https'
import fs from 'fs'
import express from 'express'

const getHttpsServer = (app) => {
    const  privateKey = fs.readFileSync('key.pem', 'utf8') 
    const certificate = fs.readFileSync('cert.pem', 'utf8')
    const credentials = { key: privateKey, cert: certificate }
    app.use(express.json())
    const httpsServer = https.createServer(credentials, app)
    return httpsServer    
}

export default getHttpsServer