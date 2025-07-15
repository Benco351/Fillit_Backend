import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'departments',
  timestamps: false,
})
export class Department extends Model<Department> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  department_id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  department_name!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    defaultValue: null,
  })
  department_address!: string | null;
} 