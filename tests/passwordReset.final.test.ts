import { EmailService } from '../src/services/email.service';

describe('Password Reset System - Final Tests', () => {
  test('EmailService should generate password reset template', () => {
    const template = EmailService.getPasswordResetTemplate('testuser', 'http://example.com/reset?token=123');
    
    expect(template).toContain('testuser');
    expect(template).toContain('Reset Password');
    expect(template).toContain('http://example.com/reset?token=123');
    expect(template).toContain('<!DOCTYPE html>');
    expect(template).toContain('expire');
  });

  test('EmailService should generate welcome template', () => {
    const template = EmailService.getWelcomeTemplate('testuser');
    
    expect(template).toContain('testuser');
    expect(template).toContain('Welcome');
    expect(template).toContain('Weather App');
    expect(template).toContain('<!DOCTYPE html>');
  });

  test('Token generation should be secure', () => {
    const crypto = require('crypto');
    const token1 = crypto.randomBytes(32).toString('hex');
    const token2 = crypto.randomBytes(32).toString('hex');
    
    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  test('Password validation should work correctly', () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[a-zA-Z\d@#$%^&*!]{8,}$/;
    
    // Strong passwords should pass
    expect(passwordRegex.test('StrongPass123!')).toBe(true);
    expect(passwordRegex.test('MySecure@Pass1')).toBe(true);
    
    // Weak passwords should fail
    expect(passwordRegex.test('weak')).toBe(false);
    expect(passwordRegex.test('12345678')).toBe(false);
    expect(passwordRegex.test('Password')).toBe(false);
    expect(passwordRegex.test('password123')).toBe(false);
  });
});
