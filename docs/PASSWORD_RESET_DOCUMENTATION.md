# Password Reset System Documentation

## Overview

The Weather App backend includes a complete password reset system with the following features:

- Secure token-based password reset
- Email notifications
- Rate limiting protection
- Comprehensive validation
- Token expiry management
- Security best practices

## Architecture

### Components

1. **AuthService** - Core business logic for password reset
2. **EmailService** - Email sending functionality
3. **RateLimiter** - Rate limiting middleware
4. **AuthController** - API endpoints
5. **PasswordReset Model** - Database schema

### Database Schema

```prisma
model PasswordReset {
  id           String   @id @default(uuid())
  user_id      String
  token        String   @unique
  expires_at   DateTime
  used         Boolean  @default(false)
  created_at   DateTime @default(now())

  // Relations
  user         User     @relation(fields: [user_id], references: [id_user], onDelete: Cascade)

  @@map("password_reset")
}
```

## API Endpoints

### 1. Request Password Reset

**POST** `/api/auth/forgot-password`

Request body:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Rate Limit:** 5 requests per 15 minutes per IP/email

### 2. Verify Reset Token

**POST** `/api/auth/verify-reset-token`

Request body:
```json
{
  "token": "reset-token-here"
}
```

Response:
```json
{
  "success": true,
  "valid": true
}
```

### 3. Reset Password

**POST** `/api/auth/reset-password`

Request body:
```json
{
  "token": "reset-token-here",
  "newPassword": "NewPassword123!"
}
```

Response:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Security Features

### 1. Token Security
- 32-byte cryptographically secure random tokens
- Unique tokens per request
- 1-hour expiry time
- Single-use tokens (marked as used after consumption)

### 2. Rate Limiting
- **Forgot Password:** 5 requests per 15 minutes per IP/email
- **Login:** 10 attempts per 15 minutes per IP
- **Registration:** 3 attempts per hour per IP

### 3. Information Disclosure Prevention
- Same response for existing and non-existing emails
- No indication whether email exists in the system
- Generic error messages for invalid tokens

### 4. Password Validation
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@#$%^&*!)

## Email Configuration

### Environment Variables

```env
# Email Configuration (Gmail example)
EMAIL_USER='your-gmail@gmail.com'
EMAIL_PASSWORD='your-app-password'
EMAIL_FROM='Weather App <noreply@weather-app.com>'

# Frontend URL for reset links
FRONTEND_URL='http://localhost:3000'
```

### Gmail Setup

1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in `EMAIL_PASSWORD`

### Email Templates

The system includes responsive HTML email templates for:
- Password reset emails
- Welcome emails for new users

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run password reset specific tests
npm run test:password-reset

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Coverage

- Unit tests for AuthService methods
- Integration tests for API endpoints
- Rate limiting tests
- Validation tests
- Security tests

### Manual Testing

Use the provided HTTP files:
- `test-password-reset.http` - Comprehensive manual testing
- `test-auth-posts-workflow.http` - Full workflow testing

## Workflow

### Complete Password Reset Flow

1. **User requests password reset**
   - User enters email on frontend
   - Frontend calls `/api/auth/forgot-password`
   - System generates secure token
   - Email sent with reset link

2. **User clicks reset link**
   - Frontend extracts token from URL
   - Optionally verify token with `/api/auth/verify-reset-token`
   - Show password reset form

3. **User submits new password**
   - Frontend calls `/api/auth/reset-password`
   - Token validated and consumed
   - Password updated in database
   - User can login with new password

### Error Handling

- **Invalid/expired tokens:** Clear error messages
- **Rate limiting:** Informative retry-after headers
- **Validation errors:** Specific field validation messages
- **Email failures:** Silent failure (security)

## Monitoring and Logs

### What to Monitor

1. **Password reset request frequency**
2. **Failed reset attempts**
3. **Email delivery failures**
4. **Rate limiting violations**

### Log Examples

```
Reset token for user@example.com: abc123...
Failed to send password reset email: SMTP Error
Rate limit exceeded for IP: 192.168.1.1
```

## Production Considerations

### 1. Email Service
- Use production email provider (SendGrid, AWS SES, etc.)
- Set up proper SPF/DKIM records
- Monitor email delivery rates

### 2. Rate Limiting
- Consider using Redis for distributed rate limiting
- Adjust limits based on usage patterns
- Monitor and alert on high failure rates

### 3. Security
- Use HTTPS in production
- Set secure cookie flags
- Implement CSRF protection
- Regular security audits

### 4. Performance
- Index `password_reset.token` for fast lookups
- Clean up expired tokens regularly
- Monitor database performance

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check EMAIL_* environment variables
   - Verify email provider settings
   - Check spam folders

2. **Rate limiting too strict**
   - Adjust limits in `rateLimiter.middleware.ts`
   - Consider user behavior patterns

3. **Tokens not working**
   - Check token expiry (1 hour)
   - Verify token hasn't been used
   - Check database connectivity

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=auth:*
```

## Future Enhancements

1. **Multi-factor authentication**
2. **Email templates customization**
3. **Admin dashboard for monitoring**
4. **SMS-based password reset**
5. **Account lockout after multiple failed attempts**
