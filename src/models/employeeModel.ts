import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/postgres/postgres"; // Your Sequelize instance

// Employee Model
interface EmployeeAttributes {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  employeePhone?: string;
  employeePassword: string;
  employeeAdmin?: boolean;
}

type EmployeeCreationAttributes = Optional<EmployeeAttributes, "employeeId">;

class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes {
  public employeeId!: number;
  public employeeName!: string;
  public employeeEmail!: string;
  public employeePhone?: string;
  public employeePassword!: string;
  public employeeAdmin?: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Employee.init(
  {
    employeeId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employeeEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employeePhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    employeePassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employeeAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "employees",
    timestamps: true,
  }
);

export default Employee;