import { createContainer, asClass, asValue, Lifetime, InjectionMode, asFunction } from 'awilix';
import AppRepository from '../repository/AppRepository.js';
import SqliteDbContext from '../dbContext/SqliteDbContext.js';
import LoggerService from '../services/LoggerService.js';
import { Sequelize } from 'sequelize';
import TaskManager from '../services/TaskManager.js';
import ConfigurationService from '../services/ConfigurationService.js';
import FileLoggerService from '../services/FileLoggerService.js';
import GpioFactory from '../services/GpioFactory.js';
import TaskQueueService from '../services/TaskQueueService.js';

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true
});

const configurationService = new ConfigurationService()
container.register({
  configurationService: asValue(configurationService)
})

const sequelizeInstance = new Sequelize({
  dialect: 'sqlite',
  storage: configurationService.getConfig().connectionString,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 3
  }
});

container.register({
  fileLoggerService: asFunction(({ configurationService }) =>
    new FileLoggerService(configurationService), { lifetime: Lifetime.SINGLETON }),
  configurationService: asValue(configurationService),

  sequelize: asValue(sequelizeInstance),
  dbContext: asFunction(({ sequelize, loggerService }) =>
    new SqliteDbContext(loggerService, sequelize), { lifetime: Lifetime.SINGLETON }),
  loggerService: asFunction(({ fileLoggerService }) =>
    new LoggerService(() => container.resolve('appRepository'), fileLoggerService), { lifetime: Lifetime.SINGLETON }),
  appRepository: asFunction(({ dbContext, loggerService }) =>
    new AppRepository(dbContext, loggerService), { lifetime: Lifetime.SINGLETON }),
  taskQueueService: asFunction(() =>
    new TaskQueueService(), { lifetime: Lifetime.SINGLETON }),
  taskManager: asFunction(({ appRepository, loggerService, taskQueueService }) =>
    new TaskManager(appRepository, loggerService, taskQueueService), { lifetime: Lifetime.SINGLETON }),
  gpioFactory: asFunction(({ configurationService }) =>
    new GpioFactory(configurationService), { lifetime: Lifetime.SINGLETON })
})

export default container