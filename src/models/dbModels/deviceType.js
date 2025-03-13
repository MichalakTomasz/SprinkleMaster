import { DataTypes, Model } from 'sequelize'

export class deviceType extends Model {}

export const initModel = (sequelize) => {
  deviceType.init(
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
      }
    },
    {
      sequelize,
      modelName: "deviceType",
      tableName: "deviceType",
      timestamps: false
    }
  )
  return deviceType;
}