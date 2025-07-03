import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import corsMiddleware from './config/cors';
import { apiRouter } from './api/v1/router';
import { initSocketServer } from './services/websocket';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/v1', apiRouter);

// WebSocket
initSocketServer(server);

const PORT = Number(process.env.PORT) || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
