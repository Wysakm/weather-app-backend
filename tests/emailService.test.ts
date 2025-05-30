import { EmailService } from '../src/services/email.service';

describe('EmailService Templates', () => {
  it('should generate password reset template', () => {
    const template = EmailService.getPasswordResetTemplate('testuser', 'http://example.com/reset?token=123');
    
    expect(template).toContain('testuser');
    expect(template).toContain('Reset Password');
    expect(template).toContain('http://example.com/reset?token=123');
    expect(template).toContain('<!DOCTYPE html>'); // Ensure it's HTML
  });

  it('should generate welcome template', () => {
    const template = EmailService.getWelcomeTemplate('testuser');
    
    expect(template).toContain('testuser');
    expect(template).toContain('Welcome');
    expect(template).toContain('Weather App');
    expect(template).toContain('<!DOCTYPE html>'); // Ensure it's HTML
  });

  it('should include security warning in password reset template', () => {
    const template = EmailService.getPasswordResetTemplate('testuser', 'http://example.com/reset?token=123');
    
    expect(template).toContain('expire');
    expect(template).toContain('didn\'t request');
  });

  it('should include app features in welcome template', () => {
    const template = EmailService.getWelcomeTemplate('testuser');
    
    expect(template).toContain('weather data');
    expect(template).toContain('air quality');
    expect(template).toContain('community');
  });
});
