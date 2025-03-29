import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/postgres/postgres"; // Your Sequelize instance

// Interface for the model attributes
interface AvailableShiftAttributes {
  shiftId: number;
  start: string;
  end?: string;
}

// Optional fields for creation
type AvailableShiftCreationAttributes = Optional<AvailableShiftAttributes, 'shiftId'>;

// Model class extending Sequelize Model
class AvailableShift extends Model<AvailableShiftAttributes, AvailableShiftCreationAttributes>
  implements AvailableShiftAttributes {
  public shiftId!: number;
  public start!: string;
  public end?: string;

  // timestamps (createdAt, updatedAt) if you use them
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define the model
AvailableShift.init(
  {
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
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'available_shifts', // fixed typo here
    timestamps: true, // or false if you don't use createdAt/updatedAt
  }
);

export default AvailableShift;