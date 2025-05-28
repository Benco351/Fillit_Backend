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
    tableName: 'available_shifts',
    timestamps: false,
  })
  export class AvailableShift extends Model<AvailableShift> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    shift_id!: number;
  
    @Column({
      type: DataType.DATEONLY,
      allowNull: true,
      defaultValue: null,
    })
    shift_date!: Date | null;
  
    @Column({
      type: DataType.TIME(),
      allowNull: true,
      defaultValue: null,
    })
    shift_time_start!: string | null;
  
    @Column({
      type: DataType.TIME(),
      allowNull: true,
      defaultValue: null,
    })
    shift_time_end!: string | null;

    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    shift_slots_amount!: number;

    @Column({
      type: DataType.INTEGER,
      allowNull: false,
      defaultValue: 0,
    })
    shift_slots_taken!: number;
  
    @HasMany(() => AssignedShift)
    assignedShifts!: AssignedShift[];
  
    @HasMany(() => RequestedShift)
    requestedShifts!: RequestedShift[];
  }
