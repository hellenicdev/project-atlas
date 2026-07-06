import { AppError } from '../src/utils/response.js';

describe('User Service Errors', () => {
  it('should create AppError with correct properties', () => {
    const err = new AppError('User not found', 404, 'USER_NOT_FOUND');
    expect(err.message).toBe('User not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('USER_NOT_FOUND');
    expect(err.isOperational).toBe(true);
  });
});
