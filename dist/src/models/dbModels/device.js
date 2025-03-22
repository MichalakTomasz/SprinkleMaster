import { DataTypes, Model } from 'sequelize'

export class device extends Model {}

export const initModel = (sequelize) => {
  device.init(
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
      pinNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      deviceTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: "device",
      tableName: "device",
      timestamps: false
    }
  )
  return device
}