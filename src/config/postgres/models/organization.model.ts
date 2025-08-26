import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
} from 'sequelize-typescript';

@Table({
  tableName: 'organizations',
  timestamps: false,
})
export class Organization extends Model<Organization> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  organization_id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  organization_name!: string;
}
