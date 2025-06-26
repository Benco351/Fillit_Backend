import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  DataType,
  BelongsTo,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Employee } from './employee.model';
import { AssignedShift } from './assignedShift.model';

@Table({
  tableName: 'shift_swap_requests',
  timestamps: false,
})
export class ShiftSwapRequest extends Model<ShiftSwapRequest> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  requester_employee_id!: number;

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  target_employee_id!: number;

  @ForeignKey(() => AssignedShift)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  requester_shift_id!: number;

  @ForeignKey(() => AssignedShift)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  target_shift_id!: number;

  @Column({
    type: DataType.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
    defaultValue: 'pending',
  })
  status!: 'pending' | 'accepted' | 'rejected' | 'cancelled';

  @Column(DataType.TEXT)
  message?: string;

  @CreatedAt
  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, field: 'created_at' })
  created_at!: Date;

  @UpdatedAt
  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updated_at!: Date;

  @BelongsTo(() => Employee, 'requester_employee_id')
  requesterEmployee!: Employee;

  @BelongsTo(() => Employee, 'target_employee_id')
  targetEmployee!: Employee;

  @BelongsTo(() => AssignedShift, 'requester_shift_id')
  requesterShift!: AssignedShift;

  @BelongsTo(() => AssignedShift, 'target_shift_id')
  targetShift!: AssignedShift;
} 