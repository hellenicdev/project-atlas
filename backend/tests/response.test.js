import { jest } from '@jest/globals';
import { successResponse, errorResponse } from '../src/utils/response.js';

describe('Response Helpers', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      reqId: 'test-id',
    };
  });

  it('successResponse should return correct shape', () => {
    successResponse(mockRes, { data: { name: 'test' }, message: 'OK' });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const [body] = mockRes.json.mock.calls[0];
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('test');
    expect(body.error).toBeNull();
  });

  it('errorResponse should return correct shape', () => {
    errorResponse(mockRes, { message: 'Error', statusCode: 400, code: 'VALIDATION_ERROR' });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    const [body] = mockRes.json.mock.calls[0];
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
