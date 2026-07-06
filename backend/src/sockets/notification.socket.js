import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const notificationSocket = (namespace) => {
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

  namespace.on('connection', (socket) => {
    logger.info(`Notification socket connected: ${socket.user.id}`);

    socket.join(`user:${socket.user.id}`);

    socket.on('notification:read', (notificationId) => {
      // handled via REST, but acknowledge
      socket.emit('notification:read', { notificationId });
    });

    socket.on('disconnect', () => {
      logger.info(`Notification socket disconnected: ${socket.user.id}`);
    });
  });
};

export default notificationSocket;
