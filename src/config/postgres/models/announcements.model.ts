// src/config/postgres/models/announcement.model.ts
import {
  Table, Column, Model, PrimaryKey, AutoIncrement,
  ForeignKey, DataType, BelongsTo
} from 'sequelize-typescript';
import {
  InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute
} from 'sequelize';
import { Employee } from './employee.model';

@Table({ tableName: 'announcements', timestamps: false })
export class Announcement extends Model<
  // Omit association fields from attributes
  InferAttributes<Announcement, { omit: 'author' }>,
  InferCreationAttributes<Announcement, { omit: 'author' }>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare announcement_id: CreationOptional<number>;

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'employees', key: 'employee_id' },
    onDelete: 'CASCADE',
  })
  declare author_id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare body: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare start_date: Date | null;

  @BelongsTo(() => Employee)
  declare author?: NonAttribute<Employee>;
}