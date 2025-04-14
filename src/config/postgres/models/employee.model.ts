import bcrypt from 'bcrypt';
import {
    Table,
    Column,
    Model,
    PrimaryKey,
    AutoIncrement,
    DataType,
    HasMany,
    BeforeCreate,
    BeforeUpdate,
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


    @BeforeCreate
    @BeforeUpdate
    static async hashPassword(instance: Employee) {
      if (instance.changed('employee_password')) {
        instance.employee_password = await bcrypt.hash(instance.employee_password, 10);
      }
    }

    async validatePassword(password: string): Promise<boolean> {
      return bcrypt.compare(password, this.employee_password);
    }
  }

  
