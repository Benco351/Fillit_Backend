import express, { Application } from 'express';
import userRoutes from './routes/userRoutes';
import availableShiftRoutes from './routes/availableShiftRoutes';
import requestedShiftRoutes from './routes/requestedShiftRoutes';

const app: Application = express();

// Middleware for parsing JSON bodies
app.use(express.json());

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/available-shifts', availableShiftRoutes);
app.use('/api/requested-shifts', requestedShiftRoutes);

export default app;