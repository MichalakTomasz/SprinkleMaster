import { DataTypes, Model } from "sequelize";

export class settings extends Model {}

export  const initModel = sequelize => {
    settings.init({
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'settings',
        tableName: 'settings',
        timestamps: false    
    })

    return settings
}
