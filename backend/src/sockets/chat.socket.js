import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const chatSocket = (namespace) => {
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
    logger.info(`Chat socket connected: ${socket.user.id}`);

    socket.on('chat:join', (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('chat:typing', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('chat:typing', { chatId, userId: socket.user.id });
    });

    socket.on('chat:stop_typing', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('chat:stop_typing', { chatId, userId: socket.user.id });
    });

    socket.on('chat:read', ({ chatId, messageId }) => {
      socket.to(`chat:${chatId}`).emit('chat:read', { chatId, messageId, userId: socket.user.id });
    });

    socket.on('disconnect', () => {
      logger.info(`Chat socket disconnected: ${socket.user.id}`);
    });
  });
};

export default chatSocket;
