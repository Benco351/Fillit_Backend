import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/postgres/postgres"; // Your Sequelize instance

// RequestedShift Model
interface RequestedShiftAttributes {
  requestId: number;
  requestShiftId: number;
  requestEmployeeId: number;
  requestNotes?: string;
  requestStatus: "pending" | "approved" | "denied";
}

type RequestedShiftCreationAttributes = Optional<RequestedShiftAttributes, "requestId" | "requestNotes" | "requestStatus">;

class RequestedShift extends Model<RequestedShiftAttributes, RequestedShiftCreationAttributes>
  implements RequestedShiftAttributes {
  public requestId!: number;
  public requestShiftId!: number;
  public requestEmployeeId!: number;
  public requestNotes?: string;
  public requestStatus!: "pending" | "approved" | "denied";
}

RequestedShift.init(
  {
    requestId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    requestShiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "available_shifts", key: "shiftId" },
    },
    requestEmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "employees", key: "employeeId" },
    },
    requestNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requestStatus: {
      type: DataTypes.ENUM("pending", "approved", "denied"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    tableName: "requested_shifts",
    timestamps: false,
  }
);

export default RequestedShift;