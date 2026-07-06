import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, {
      message: 'Validation failed',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export default validate;
