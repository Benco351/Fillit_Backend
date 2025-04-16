import express, { Application } from 'express';
import employeeRoutes from './routes/employeeRoutes';
import availableShiftRoutes from './routes/availableShiftRoutes';
import requestedShiftRoutes from './routes/requestedShiftRoutes';
import assignedShiftRoutes from './routes/assignedShiftRoutes';

import cors from 'cors';
import compression from 'compression';


const result = require('dotenv').config();
const app: Application = express();
 
if (result.error) {
    throw result.error;
  }

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials',"true");

    // Pass to next layer of middleware
    next();
});

// Register routes
app.use('/api/employees', employeeRoutes);
app.use('/api/available-shifts', availableShiftRoutes);
app.use('/api/requested-shifts', requestedShiftRoutes);
app.use('/api/assigned-shifts',assignedShiftRoutes)

//AWS health check route
app.use('/health', (req, res, {}) => {
  res.status(200).end();
});

export default app;