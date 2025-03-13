import { createContainer, asClass, } from 'awilix'
import MainController from '../controllers/MainController.js'
import { DataManager } from '../services/DataManager.js'

const container = createContainer()

container.register({
  mainController: asClass(MainController).singleton().inject(() => 
    ({
      baseUrl: 'http://watter-pump:3200/'})),
  dataManager: asClass(DataManager).singleton()
})

export default container 