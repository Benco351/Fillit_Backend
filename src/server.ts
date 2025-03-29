import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectMongoDB } from './config/mongodb/db';
import { connectPostgres, sequelize } from './config/postgres/db';
import { initModels } from './config/postgres/models'; // adjust the path as needed

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // // Connect to MongoDB
    // await connectMongoDB();

    // Connect to PostgreSQL
    await connectPostgres();

    // Initialize all Sequelize models and associations
    initModels(sequelize);

    // Sync Sequelize models with the database
    await sequelize.sync();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
})();
