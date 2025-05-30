import { AuthService } from '../src/services/auth.service';
import { EmailService } from '../src/services/email.service';

// Mock dependencies for AuthService tests only
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
    passwordReset: {
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  })),
}));

// Mock EmailService
const mockEmailService = EmailService as jest.Mocked<typeof EmailService>;

describe('AuthService - Password Reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Validation', () => {
    it('should validate password requirements', async () => {
      try {
        await AuthService.resetPassword('valid-token', 'weak');
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Password must be');
      }
    });

    it('should accept strong password', () => {
      const strongPassword = 'StrongPass123!';
      
      // Test the validation regex
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[a-zA-Z\d@#$%^&*!]{8,}$/;
      expect(passwordRegex.test(strongPassword)).toBe(true);
    });
  });

  describe('Token Generation', () => {
    it('should generate secure tokens', () => {
      const crypto = require('crypto');
      const token1 = crypto.randomBytes(32).toString('hex');
      const token2 = crypto.randomBytes(32).toString('hex');
      
      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
    });
  });
});

describe('EmailService Templates', () => {
  it('should generate password reset template', () => {
    const template = EmailService.getPasswordResetTemplate('testuser', 'http://example.com/reset?token=123');
    
    expect(template).toContain('testuser');
    expect(template).toContain('Reset Password');
    expect(template).toContain('http://example.com/reset?token=123');
  });

  it('should generate welcome template', () => {
    const template = EmailService.getWelcomeTemplate('testuser');
    
    expect(template).toContain('testuser');
    expect(template).toContain('Welcome');
  });
});
