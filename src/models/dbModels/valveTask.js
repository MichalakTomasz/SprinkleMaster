import { DataTypes, Model } from 'sequelize'
import moment from 'moment'

export class valveTask extends Model {}

export const initModel = (sequelize) => {
  valveTask.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      start: {
        type: DataTypes.DATE,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('start')
          return rawValue ? moment(rawValue).format('HH:mm') : null
        }
      },
      stop: {
        type: DataTypes.DATE,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('stop')
          return rawValue ? moment(rawValue).format('HH:mm') : null
        }
      },
      period: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: "valveTask",
      tableName: "valveTask",
      timestamps: false
    }
  )
  return valveTask;
}