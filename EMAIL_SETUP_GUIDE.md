# 📧 Email Setup Guide for Weather App

## Current Issue
The password reset system is configured but cannot send emails due to authentication issues with Outlook/Hotmail.

## 🔧 Quick Fix Options

### Option 1: Use Gmail (Recommended for Testing)
1. **Create/Use Gmail Account**
2. **Enable 2-Factor Authentication**: https://myaccount.google.com/security
3. **Generate App Password**: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (custom name)"
   - Name it "Weather App Backend"
   - Copy the 16-character password
4. **Update .env file**:
   ```env
   EMAIL_USER='your-gmail@gmail.com'
   EMAIL_PASSWORD='your-16-char-app-password'
   EMAIL_FROM='Weather App <your-gmail@gmail.com>'
   ```
5. **Keep current EmailService settings** (already configured for Gmail)

### Option 2: Fix Outlook/Hotmail
1. **Go to Microsoft Account Security**: https://account.microsoft.com/security
2. **Enable Two-Step Verification** (required)
3. **Create App Password**:
   - Advanced security options → "Create a new app password"
   - Name: "Weather App Backend"
   - Copy the generated password
4. **Update .env file**:
   ```env
   EMAIL_USER='chalita_ns@hotmail.com'
   EMAIL_PASSWORD='your-app-password-from-microsoft'
   EMAIL_FROM='Weather App <chalita_ns@hotmail.com>'
   ```
5. **Update EmailService**:
   ```typescript
   host: 'smtp-mail.outlook.com'
   ```

## 🧪 Testing Steps
After setting up either option:

1. **Test Email Connection**:
   ```bash
   cd /Users/teerapad/Desktop/Wearther-App/weather-app-backend
   npx ts-node test-outlook.ts
   ```

2. **Test Password Reset in Postman**:
   - POST `/auth/forgot-password` with your email
   - Check email for reset link
   - POST `/auth/verify-reset-token` with token
   - POST `/auth/reset-password` with new password

## 📋 Current Status
- ✅ Password reset API endpoints implemented
- ✅ Email service with welcome and reset email templates
- ✅ TypeScript compilation errors fixed
- ✅ Database models and JWT handling
- ❌ Email authentication (needs App Password)
- ❌ End-to-end testing

## 🎯 Next Steps
1. Set up App Password (Option 1 or 2 above)
2. Run email test to verify connection
3. Test complete password reset flow in Postman
4. Document successful configuration
