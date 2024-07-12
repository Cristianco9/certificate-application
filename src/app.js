import express from 'express';
import morgan from 'morgan';
import { testConnection } from './libraries/DBConnection.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from "../config/config.js";
import routerApi from './routes/indexRouter.js';
import {
    logError,
    errorHandler,
    boomErrorHandler,
    ORMErrorHandler
} from "./middlewares/errorHandler.js"

// Create the app with express
const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Test data base connection
testConnection();

// Select router
routerApi(app);

// CORS
const whiteList = ['http://127.0.0.1:3000'];
const options = {
  origin: (origin, callback) => {
    if (whiteList.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed'));
    }
  }
}
app.use(cors());

const passport = import('./utils/auth/indexAuth.js');

// Error middlewares
app.use(logError);
app.use(ORMErrorHandler);
app.use(boomErrorHandler);
app.use(errorHandler);

// Export the app
export default app;