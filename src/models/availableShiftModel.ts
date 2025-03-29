import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database"; // Import your Sequelize instance

const AvailableShift = sequelize.define(
  'AvailableShift',
  {
    // Model attributes are defined here
    shiftId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    start: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end: {
      type: DataTypes.TIME,
    }
  }, 
  {
    tablename: 'available_shifts',
  },
);

export default AvailableShift;
