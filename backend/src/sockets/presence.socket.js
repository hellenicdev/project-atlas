import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const presenceSocket = (namespace) => {
  namespace.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, env.jwtSecret);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  const onlineUsers = new Set();

  namespace.on('connection', (socket) => {
    const userId = socket.user.id;
    onlineUsers.add(userId);
    namespace.emit('user:online', { userId });
    logger.info(`Presence online: ${userId}`);

    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      namespace.emit('user:offline', { userId });
      logger.info(`Presence offline: ${userId}`);
    });
  });
};

export default presenceSocket;
