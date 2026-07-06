export const successResponse = (res, { data = null, message = 'Success', statusCode = 200 } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
    timestamp: new Date().toISOString(),
    requestId: res.reqId || null,
  });
};

export const errorResponse = (res, { message = 'Internal server error', statusCode = 500, code = null, details = null } = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: { code, details },
    timestamp: new Date().toISOString(),
    requestId: res.reqId || null,
  });
};

export class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}
