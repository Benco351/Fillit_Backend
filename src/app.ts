// src/app.ts
import 'dotenv/config';
import express, { Application } from 'express';
import compression from 'compression';
import cors from 'cors';

import { tokenAuthentication } from './middlewares/authMiddleware';

import employeeRoutes from './api/v1/routes/employee.routes';
import availableShiftRoutes from './api/v1/routes/availableShift.routes';
import requestedShiftRoutes from './api/v1/routes/requestedShift.routes';
import assignedShiftRoutes from './api/v1/routes/assignedShift.routes';
import { errorHandler } from './middlewares/errorMiddleware';

const app: Application = express();

const FRONTEND_URL = process.env.FRONTEND_URL!;
const whitelist = [FRONTEND_URL];

const corsOptions: cors.CorsOptions = {
  origin: (incomingOrigin, callback) => {
    // allow calls with no origin (e.g. mobile clients, curl)
    if (!incomingOrigin || whitelist.includes(incomingOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS violation: ${incomingOrigin} not in whitelist`));
    }
  },
  credentials: true,
};

// ── MIDDLEWARES ──
app
  .use(express.urlencoded({ extended: true }))
  .use(compression())
  .use(cors({ origin: "*", credentials: true }))
  .use(express.json());

// public heath‑check for AWS load balancer
app.get('/health', (_req, res) => res.sendStatus(200));

// ── PROTECTED ROUTES ──
// all /api/* endpoints now require a valid Bearer token
app.use('/api', tokenAuthentication);

// mount versioned routers under /api
app.use('/api/employees',        employeeRoutes);
app.use('/api/available-shifts', availableShiftRoutes);
app.use('/api/requested-shifts', requestedShiftRoutes);
app.use('/api/assigned-shifts',  assignedShiftRoutes);

// global error handler
app.use(errorHandler);

export default app;
