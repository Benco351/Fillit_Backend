import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType, BelongsTo } from 'sequelize-typescript';
import { Organization } from './organization.model';

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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'organization_id',
    },
    onDelete: 'CASCADE',
  })
  organization_id!: number;

  @BelongsTo(() => Organization, { foreignKey: 'organization_id' })
  organization!: Organization;
} 