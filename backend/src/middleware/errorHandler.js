import { errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    requestId: req.reqId,
    userId: req.user?.id,
    url: req.originalUrl,
  });

  if (err.isOperational) {
    return errorResponse(res, {
      message: err.message,
      statusCode: err.statusCode,
      code: err.code,
    });
  }

  if (err.name === 'CastError') {
    return errorResponse(res, {
      message: 'Invalid ID format',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  }

  if (err.code === 11000) {
    return errorResponse(res, {
      message: 'Duplicate field value',
      statusCode: 409,
      code: 'DUPLICATE_ERROR',
    });
  }

  return errorResponse(res, {
    message: 'Internal server error',
    statusCode: 500,
    code: 'SYSTEM_ERROR',
  });
};

export default errorHandler;
