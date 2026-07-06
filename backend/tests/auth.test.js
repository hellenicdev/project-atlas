import { sanitizeUser } from '../src/services/auth.service.js';

describe('Auth Service', () => {
  describe('sanitizeUser', () => {
    it('should remove sensitive fields', () => {
      const user = {
        _id: '123',
        name: 'Test',
        email: 'test@test.com',
        passwordHash: 'secret',
        loginAttempts: 0,
        lockUntil: null,
        __v: 0,
        toObject: () => user,
      };

      const result = sanitizeUser(user);
      expect(result.passwordHash).toBeUndefined();
      expect(result.loginAttempts).toBeUndefined();
      expect(result.lockUntil).toBeUndefined();
      expect(result.__v).toBeUndefined();
      expect(result.name).toBe('Test');
    });
  });
});
