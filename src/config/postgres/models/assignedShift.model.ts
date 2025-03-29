import {
    Table,
    Column,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    DataType,
    BelongsTo,
  } from 'sequelize-typescript';
  import { AvailableShift } from './availableShift.model';
  import { Employee } from './employee.model';
  
  @Table({
    tableName: 'assigned_shifts',
    timestamps: false,
  })
  export class AssignedShift extends Model<AssignedShift> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    assigned_id!: number;
  
    @ForeignKey(() => AvailableShift)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    assigned_shift_id_fkey!: number;
  
    @ForeignKey(() => Employee)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    assigned_employee_id_fkey!: number;
  
    @BelongsTo(() => AvailableShift)
    availableShift!: AvailableShift;
  
    @BelongsTo(() => Employee)
    employee!: Employee;
  }
  