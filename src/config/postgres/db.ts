import { Sequelize } from 'sequelize-typescript';
import { Employee } from './models/employee.model';
import { AvailableShift } from './models/availableShift.model';
import { AssignedShift } from './models/assignedShift.model';
import { RequestedShift } from './models/requestedShift.model';

export const sequelize = new Sequelize({
  database: process.env.PG_DATABASE,
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  define: {
    schema: 'public',          // ← ensures all models sync into “public”
  },
  dialect: 'postgres',
  models: [Employee, AvailableShift, AssignedShift, RequestedShift],
  dialectOptions: process.env.PG_SSL === 'true'
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        }
      }
    : {},
  logging: false,
});



export const connectPostgres = async (): Promise<void> => {
    try {
      await sequelize.authenticate();
      console.log('PostgreSQL connected successfully.');
  
      // Synchronize models with the database
      await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables (use with caution)
      console.log('Database tables synchronized.');
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      throw error;
    }
  };