import { deviceType, initModel as initDeviceType } from '../models/dbModels/deviceType.js';
import { device, initModel as initDevice } from '../models/dbModels/device.js'
import { valveTask, initModel as initValveTask } from '../models/dbModels/valveTask.js'
import { initModel as initDbLog } from '../models/dbModels/dbLog.js'
import { initModel as initSettings, settings } from '../models/dbModels/settings.js'
import Settings from '../models/Settings.js';

export default class SqliteDbContext {
    #isConnected = false
    #isSyncing = false
    #initializationPromise = null

    constructor(loggerService, sequelize) {
        this.sequelize = sequelize
        this.loggerService = loggerService
    }
  
    async initConnection() {
        try {
            if (!this.sequelize) {
                throw new Error('Sequelize instance not initialized.');
            }

            if (this.#initializationPromise) {
                return this.#initializationPromise;
            }

            this.#initializationPromise = (async () => {
                this.#isSyncing = true;
                this.loggerService.suppressDbLogging = true;
                
                try {
                    // Initialize models first
                    initDeviceType(this.sequelize)
                    initDevice(this.sequelize)
                    initValveTask(this.sequelize)
                    initDbLog(this.sequelize)
                    initSettings(this.sequelize)
                    this.setupAssociations()
                    
                    // Then sync database
                    await this.sequelize.sync()
                    
                    // Test connection
                    const isConnected = await this.testConnection();
                    if (!isConnected) {
                        throw new Error('Database connection test failed');
                    }
                    
                    // Seed only after successful connection
                    await this.seedDatabase();
                    
                    this.#isConnected = true;
                    return true;
                } catch (error) {
                    this.#isConnected = false;
                    throw error;
                } finally {
                    this.#isSyncing = false;
                    this.loggerService.suppressDbLogging = false;
                }
            })();

            return await this.#initializationPromise;
        } catch (e) {
            this.#isConnected = false;
            this.#initializationPromise = null;
            this.loggerService.logError(`Database initialization error: ${e.message}`);
            throw e;
        }
    }

    async ensureCreated() {
        try {
            if (this.#isSyncing) return true;
            if (!this.#isConnected || !this.sequelize) {
                return await this.initConnection();
            }
            return true;
        } catch (e) {
            this.loggerService.logError(`Database ensure created error: ${e.message}`);
            return false;
        }
    }

    setupAssociations() {
        device.belongsTo(deviceType, { 
            foreignKey: 'deviceTypeId',
            targetKey: 'id',
            as: 'type'
        })
        
        deviceType.hasMany(device, { 
            foreignKey: 'deviceTypeId',
            sourceKey: 'id',
            as: 'devices'
        })
        
        device.belongsToMany(valveTask, { 
            through: 'taskDevice'
            
        })
        
        valveTask.belongsToMany(device, { 
            through: 'taskDevice'
        })
    }
    
    async testConnection() {
        try {
            await this.sequelize.authenticate()
            this.loggerService.logInfo('Connection has been established successfully.')
            return true
        } catch (e) {
            this.loggerService.logError('Unable to connect to the database:', e.message)
            return false
        }
    }

    async seedDatabase() {
        try {

            const count = await deviceType.count()
            if (count > 0) {
                return
            }

            await this.sequelize.transaction(async (t) => {
                await deviceType.bulkCreate([
                    { name: 'PUMP' },
                    { name: 'VALVE' }
                ], { transaction: t })

                await settings.bulkCreate([
                    { key: Settings.autostartScheduler, value: true },
                    { key: Settings.pumpStopDelay, value: 3000 },
                    { key: Settings.schedulerTick, value: 3000 }
            ], { transaction: t})
            })
        } catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                return
            }
            this.loggerService.logError(`Seeding failed: ${e.message}`)
            throw e
        }
    }
}