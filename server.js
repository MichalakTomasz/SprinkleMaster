import container from './src/container/container.js';
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import addEndpointsLogging from './src/middleware/addEndpointsLogging.js';
import router  from './src/controllers/gpioController.js'
import StatusCode from './src/models/StatusCode.js';
import setupProcessHandlers from './src/middleware/processHandlers.js'
import cors from 'cors'

const app = express();
const PORT = 3200;
const loggerService = container.resolve('loggerService')

loggerService.addConsoleLogging = true
loggerService.addDbLogging = false
loggerService.addFileLogging = true

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

app.use(cors({
  orign: 'http://localhost:5173'
}))

app.use(express.json())
app.use(express.static(path.join(dirname, 'client')))
app.use(addEndpointsLogging)

app.get('', (req, res) => {
  res.sendFile(path.join(dirname, 'client', 'index.html'));
});

app.use('/gpio', router)

app.use('*', (req, res) => res.status(StatusCode.NotFound).json({message: 'Endpoint not found.'}))

const server = app.listen(PORT, () => {
    loggerService.logInfo(`Server started on port ${PORT}`);
})

setupProcessHandlers(server)