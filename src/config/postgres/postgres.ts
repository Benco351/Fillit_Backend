import { Sequelize } from 'sequelize';

  export const sequelize = new Sequelize(
    process.env.PG_DATABASE as string,
    process.env.PG_USER as string,
    process.env.PG_PASSWORD as string,
    {
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.PG_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
      logging: false,
    }
  );

  export const connectPostgres = async (): Promise<void> => {
    try {
      await sequelize.authenticate();
      console.log('PostgreSQL connected successfully.');
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      throw error;
    }
  };