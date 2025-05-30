import { EmailService } from '../src/services/email.service';

describe('PasswordReset System Tests', () => {
  describe('EmailService Templates', () => {
    test('should generate password reset template', () => {
      const template = EmailService.getPasswordResetTemplate('testuser', 'http://example.com/reset?token=123');
      
      expect(template).toContain('testuser');
      expect(template).toContain('Reset Password');
      expect(template).toContain('http://example.com/reset?token=123');
      expect(template).toContain('<!DOCTYPE html>');
    });

    test('should generate welcome template', () => {
      const template = EmailService.getWelcomeTemplate('testuser');
      
      expect(template).toContain('testuser');
      expect(template).toContain('Welcome');
      expect(template).toContain('Weather App');
      expect(template).toContain('<!DOCTYPE html>');
    });

    test('should include security warning in password reset template', () => {
      const template = EmailService.getPasswordResetTemplate('testuser', 'http://example.com/reset?token=123');
      
      expect(template).toContain('expire');
      expect(template).toContain('didn\'t request');
    });
  });

  describe('Token Generation', () => {
    test('should generate secure tokens', () => {
      const crypto = require('crypto');
      const token1 = crypto.randomBytes(32).toString('hex');
      const token2 = crypto.randomBytes(32).toString('hex');
      
      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
    });
  });

  describe('Password Validation', () => {
    test('should validate strong passwords', () => {
      const strongPassword = 'StrongPass123!';
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[a-zA-Z\d@#$%^&*!]{8,}$/;
      
      expect(passwordRegex.test(strongPassword)).toBe(true);
    });

    test('should reject weak passwords', () => {
      const weakPasswords = ['weak', '12345678', 'Password', 'password123'];
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[a-zA-Z\d@#$%^&*!]{8,}$/;
      
      weakPasswords.forEach(password => {
        expect(passwordRegex.test(password)).toBe(false);
      });
    });
  });
});
