import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { errorResponse, AppError } from '../utils/response.js';

const authenticate = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'AUTH_UNAUTHORIZED');
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, {
        message: 'Token expired',
        statusCode: 401,
        code: 'AUTH_TOKEN_EXPIRED',
      });
    }
    return errorResponse(res, {
      message: error.message || 'Authentication failed',
      statusCode: 401,
      code: 'AUTH_UNAUTHORIZED',
    });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      req.user = jwt.verify(token, env.jwtSecret);
    }
  } catch {
    // no auth needed
  }
  next();
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, {
        message: 'Insufficient permissions',
        statusCode: 403,
        code: 'AUTH_FORBIDDEN',
      });
    }
    next();
  };
};

export default authenticate;
