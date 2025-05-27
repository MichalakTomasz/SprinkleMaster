import { DataTypes, Model } from 'sequelize'

export class weatherPrediction extends Model {}

export const initModel = (sequelize) => {
  weatherPrediction.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false
      },
      rain: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: "weatherPrediction",
      tableName: "weatherPrediction",
      timestamps: false
    }
  )
  return weatherPrediction
}