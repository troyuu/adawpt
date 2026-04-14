import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import sequelize from './config/database.js';
import redis from './config/redis.js';
import { authMiddleware } from './middleware/auth.js';
import { setupConnectionHandlers } from './services/connection.js';
import { startNotificationSubscription } from './services/notification.js';
import { registerEventHandlers } from './events/handlers.js';

// ── Express ──────────────────────────────────────────────────────────
const app = express();
const server = createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Health-check endpoint
app.get('/health', async (req, res) => {
  const checks = { service: 'adawpt-realtime' };

  try {
    await sequelize.authenticate();
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  try {
    const pong = await redis.ping();
    checks.redis = pong === 'PONG' ? 'ok' : 'error';
  } catch {
    checks.redis = 'error';
  }

  const allOk = checks.database === 'ok' && checks.redis === 'ok';
  res.status(allOk ? 200 : 503).json({ status: allOk ? 'ok' : 'degraded', ...checks });
});

// ── Socket.IO ────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Apply JWT authentication middleware
io.use(authMiddleware);

// Register connection / disconnection + per-socket event handlers
setupConnectionHandlers(io, registerEventHandlers);

// ── Redis subscription (notifications channel → Socket.IO) ──────────
startNotificationSubscription(io);

// ── Start server ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Realtime service running on port ${PORT}`);
});
