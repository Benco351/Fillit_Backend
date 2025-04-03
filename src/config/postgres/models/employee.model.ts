import {
    Table,
    Column,
    Model,
    PrimaryKey,
    AutoIncrement,
    DataType,
    HasMany,
  } from 'sequelize-typescript';
  import { AssignedShift } from './assignedShift.model';
  import { RequestedShift } from './requestedShift.model';
  
  @Table({
    tableName: 'employees',
    timestamps: false,
  })
  export class Employee extends Model<Employee> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    employee_id!: number;
  
    @Column({
      type: DataType.STRING(255),
      allowNull: false,
    })
    employee_name!: string;
  
    @Column({
      type: DataType.STRING(255),
      allowNull: false,
      unique: true,
    })
    employee_email!: string;
  
    @Column({
      type: DataType.STRING(20),
      allowNull: true,
      defaultValue: null,
    })
    employee_phone!: string | null;
  
    @Column({
      type: DataType.STRING(255),
      allowNull: false,
    })
    employee_password!: string;
  
    @Column({
      type: DataType.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
    employee_admin!: boolean;
  
    @HasMany(() => AssignedShift)
    assignedShifts!: AssignedShift[];
  
    @HasMany(() => RequestedShift)
    requestedShifts!: RequestedShift[];
  }
