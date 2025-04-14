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
  
  export enum RequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    DENIED = 'denied',
  }
  
  @Table({
    tableName: 'requested_shifts',
    timestamps: false,
  })
  export class RequestedShift extends Model<RequestedShift> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    request_id!: number;
  
    @ForeignKey(() => AvailableShift)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    request_shift_id!: number;
  
    @ForeignKey(() => Employee)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    request_employee_id!: number;
  
    @Column({
      type: DataType.TEXT,
      allowNull: true,
      defaultValue: null,
    })
    request_notes!: string | null;
  
    @Column({
      type: DataType.ENUM(...Object.values(RequestStatus)),
      allowNull: false,
      defaultValue: RequestStatus.PENDING,// .APPROVED
    })
    request_status!: RequestStatus;
  
    @BelongsTo(() => AvailableShift)
    availableShift!: AvailableShift;
  
    @BelongsTo(() => Employee)
    employee!: Employee;
  }
  