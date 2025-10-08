import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import verifyRouter from './routes/verify';
import logger from './utils/logger';
import { getWorkerId } from './utils/workerId';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const workerId = getWorkerId();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    /\.railway\.app$/,  // Allow all Railway apps
  ],
  credentials: true,
}));
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    workerId,
    timestamp: new Date().toISOString(),
  });
  next();
});

// Routes
app.use('/', verifyRouter);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Verification Service started`, {
    port: PORT,
    workerId,
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

export default app;
