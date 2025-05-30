import { EmailService } from './src/services/email.service';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testOutlookEmail() {
  try {
    console.log('🧪 Testing Outlook connection...');
    console.log('📧 Using email:', process.env.EMAIL_USER);
    console.log('🔑 Email password set:', !!process.env.EMAIL_PASSWORD);
    console.log('📬 Email from:', process.env.EMAIL_FROM);
    
    // Check if credentials are loaded
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Missing email credentials in environment variables');
      console.error('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
      console.error('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');
      process.exit(1);
    }
    
    // Test connection
    const isConnected = await EmailService.testConnection();
    if (!isConnected) {
      console.error('❌ Connection failed');
      console.error('Check your EMAIL_USER and EMAIL_PASSWORD in .env file');
      process.exit(1);
    }
    
    console.log('✅ Outlook connection successful!');
    
    // Test sending password reset email
    console.log('📧 Sending test password reset email...');
    await EmailService.sendPasswordResetEmail(
      'teerapad.test@gmail.com', // อีเมลสำหรับทดสอบ
      'Teerapad Tester',
      'test-reset-token-12345'
    );
    
    console.log('✅ Test password reset email sent successfully!');
    
    // Test sending welcome email
    console.log('📧 Sending test welcome email...');
    await EmailService.sendWelcomeEmail({
      email: 'teerapad.test@gmail.com', // อีเมลสำหรับทดสอบ
      username: 'Teerapad Tester'
    });
    
    console.log('✅ Test welcome email sent successfully!');
    console.log('🎉 All email tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication failed')) {
        console.error('💡 Tip: Check your EMAIL_USER and EMAIL_PASSWORD in .env file');
      } else if (error.message.includes('connect ECONNREFUSED')) {
        console.error('💡 Tip: Check your internet connection or SMTP settings');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
console.log('🚀 Starting Outlook email test...');
testOutlookEmail()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  });