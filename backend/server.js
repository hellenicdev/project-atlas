import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './src/app.js';
import env from './src/config/env.js';
import connectDB from './src/config/db.js';
import logger from './src/utils/logger.js';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: env.frontendUrl, credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach io to app for use in routes/controllers
app.set('io', io);

// Socket.IO namespaces
const chatNamespace = io.of('/chat');
const notificationNamespace = io.of('/notifications');
const presenceNamespace = io.of('/presence');

// Import socket handlers
import('./src/sockets/chat.socket.js').then(m => m.default(chatNamespace));
import('./src/sockets/notification.socket.js').then(m => m.default(notificationNamespace));
import('./src/sockets/presence.socket.js').then(m => m.default(presenceNamespace));

const start = async () => {
  await connectDB();
  server.listen(env.port, () => {
    logger.info(`Atlas backend running on port ${env.port} (${env.nodeEnv})`);
  });
};

start();

export { io, server };
