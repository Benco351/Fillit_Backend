import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/postgres/postgres"; // Your Sequelize instance

// AssignedShift Model
interface AssignedShiftAttributes {
    assignedId: number;
    assignedShiftIdFkey: number;
    assignedEmployeeIdFkey: number;
  }
  
  type AssignedShiftCreationAttributes = Optional<AssignedShiftAttributes, "assignedId">;
  
  class AssignedShift extends Model<AssignedShiftAttributes, AssignedShiftCreationAttributes>
    implements AssignedShiftAttributes {
    public assignedId!: number;
    public assignedShiftIdFkey!: number;
    public assignedEmployeeIdFkey!: number;
  }
  
  AssignedShift.init(
    {
      assignedId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      assignedShiftIdFkey: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "available_shifts", key: "shiftId" },
      },
      assignedEmployeeIdFkey: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "employees", key: "employeeId" },
      },
    },
    {
      sequelize,
      tableName: "assigned_shifts",
      timestamps: false,
    }
  );
  
  export default AssignedShift;