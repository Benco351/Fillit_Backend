import 'dotenv/config';
// src/app.ts
import express, { Application } from 'express';
import compression from 'compression';
import cors from 'cors';

import { tokenAuthentication } from './middlewares/authMiddleware';

import authRoutes from './api/v1/routes/auth.routes';
import employeeRoutes from './api/v1/routes/employee.routes';
import availableShiftRoutes from './api/v1/routes/availableShift.routes';
import requestedShiftRoutes from './api/v1/routes/requestedShift.routes';
import assignedShiftRoutes from './api/v1/routes/assignedShift.routes';
import { errorHandler } from './middlewares/errorMiddleware';
import adminRoutes from './api/v1/routes/admin.routes';

const app: Application = express();

const FRONTEND_URL = "https://www.fillitshifits.com";
const whitelist = [FRONTEND_URL, "localhost:3000", "http://localhost:3000"];

const corsOptions: cors.CorsOptions = {
  // Only allow your SPA origin (and also allow tools like curl with no Origin header)
  origin: (incomingOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!incomingOrigin || whitelist.includes(incomingOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS violation: ${incomingOrigin} not in whitelist`), undefined);
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,      // some legacy browsers choke on 204 for preflight
  maxAge: 86400,                  // cache preflight for 24h
};

// ── MIDDLEWARES ──
app
  .use(express.urlencoded({ extended: true }))
  .use(compression())
  .use(express.json());

// IMPORTANT: handle preflight across all routes
app.options('*', cors(corsOptions));

// Then enable CORS on your real routes
app.use(cors(corsOptions));

// public heath‑check for AWS load balancer
app.get('/health', (_req, res) => res.sendStatus(200));

// Mount all auth routes (including /add-to-group)
app.use('/auth', authRoutes);


// ── PROTECTED ROUTES ──
// all /api/* endpoints now require a valid Bearer token
//app.use('/api', tokenAuthentication);
app.use('/admin', adminRoutes);
// mount versioned routers under /api

app.use('/api/employees',        employeeRoutes);
app.use('/api/available-shifts', availableShiftRoutes);
app.use('/api/requested-shifts', requestedShiftRoutes);
app.use('/api/assigned-shifts',  assignedShiftRoutes);

// global error handler
app.use(errorHandler);

export default app;
