import 'dotenv/config';
import app from './app';
import { connectPostgres, sequelize } from './config/postgres/db';
import { initModels } from './config/postgres/models';

const PORT = parseInt(process.env.PORT || '8000', 10);

(async () => {
  try {
    await connectPostgres();
    initModels(sequelize);
    await sequelize.sync({ alter: true, searchPath: 'public'});
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Error starting server:', error);
    throw error; // Rethrow the error to stop the process
  }
})();
export default app;
export { sequelize }; // Export sequelize instance for testing purposes