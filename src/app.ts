import express, { Application , NextFunction} from 'express';
import userRoutes from './routes/userRoutes';
import availableShiftRoutes from './routes/availableShiftRoutes';
import requestedShiftRoutes from './routes/requestedShiftRoutes';
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
app.use('/api/users', userRoutes);
app.use('/api/available-shifts', availableShiftRoutes);
app.use('/api/requested-shifts', requestedShiftRoutes);





export default app;