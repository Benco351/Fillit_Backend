import 'dotenv/config';
import app from './app';
import { connectPostgres, sequelize } from './config/postgres/db';
import { initModels } from './config/postgres/models';

const PORT = process.env.PORT ?? 8000;

(async () => {
  try {
    await connectPostgres();
    initModels(sequelize);
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
})();
export default app;
export { sequelize }; // Export sequelize instance for testing purposes