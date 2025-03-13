import { Model, DataTypes } from 'sequelize'

export class dbLog extends Model {}

export const initModel = (sequelize) => {
    dbLog.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        level: {
            type: DataTypes.STRING,
            defaultValue: 'INFO',
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'dbLog',
        tableName: 'dbLog',
        timestamps: false
    });

    return dbLog;
}



