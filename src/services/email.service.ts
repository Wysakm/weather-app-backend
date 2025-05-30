import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  static async sendPasswordResetEmail(email: string, username: string, token: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Password Reset Request - Weather App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
              <h2 style="color: #2c3e50; text-align: center;">🌤️ Weather App</h2>
              <h3 style="color: #34495e;">Password Reset Request</h3>
              
              <p>Hello <strong>${username}</strong>,</p>
              
              <p>You requested to reset your password for Weather App. Click the button below to reset it:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #3498db; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 5px; font-weight: bold;
                          display: inline-block;">
                  🔐 Reset Password
                </a>
              </div>
              
              <p style="color: #e74c3c; font-weight: bold;">⏰ This link will expire in 1 hour.</p>
              
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
              
              <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
                This is an automated message from Weather App. Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully via Gmail:', result.messageId);
      
    } catch (error) {
      console.error('❌ Failed to send email via Gmail:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  static async sendWelcomeEmail(user: { email: string; username: string }): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Welcome to Weather App! 🌤️',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
              <h2 style="color: #2c3e50; text-align: center;">🌤️ Welcome to Weather App!</h2>
              
              <p>Hello <strong>${user.username}</strong>,</p>
              
              <p>Welcome to Weather App! We're excited to have you on board. 🎉</p>
              
              <p>With Weather App, you can:</p>
              <ul style="color: #34495e;">
                <li>🌡️ Check current weather conditions</li>
                <li>📅 View detailed weather forecasts</li>
                <li>📍 Get weather for any location</li>
                <li>⚡ Receive real-time weather updates</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}" 
                   style="background-color: #27ae60; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 5px; font-weight: bold;
                          display: inline-block;">
                  🚀 Start Using Weather App
                </a>
              </div>
              
              <p>If you have any questions or need help getting started, feel free to contact our support team.</p>
              
              <p>Thank you for choosing Weather App!</p>
              
              <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
              
              <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
                This is an automated message from Weather App. Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully via Gmail:', result.messageId);
      
    } catch (error) {
      console.error('❌ Failed to send welcome email via Gmail:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  // Static methods for template generation (for testing)
  static getPasswordResetTemplate(username: string, resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2c3e50; text-align: center;">🌤️ Weather App</h2>
          <h3 style="color: #34495e;">Password Reset Request</h3>
          
          <p>Hello <strong>${username}</strong>,</p>
          
          <p>You requested to reset your password for Weather App. Click the button below to reset it:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #3498db; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;
                      display: inline-block;">
              🔐 Reset Password
            </a>
          </div>
          
          <p style="color: #e74c3c; font-weight: bold;">⏰ This link will expire in 1 hour.</p>
          
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
      </div>
    `;
  }

  static getWelcomeTemplate(username: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2c3e50; text-align: center;">🌤️ Welcome to Weather App!</h2>
          
          <p>Hello <strong>${username}</strong>,</p>
          
          <p>Welcome to Weather App! We're excited to have you on board. 🎉</p>
          
          <p>You can now:</p>
          <ul>
            <li>📍 Share weather updates from your location</li>
            <li>📱 View weather posts from other users</li>
            <li>🌟 Connect with weather enthusiasts</li>
          </ul>
          
          <p>Thank you for joining our community!</p>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #e8f5e8; border-radius: 5px;">
            <p style="margin: 0; color: #27ae60; font-weight: bold;">Ready to start sharing weather updates? 🌦️</p>
          </div>
          
          <p style="text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 14px;">
            Best regards,<br>The Weather App Team
          </p>
        </div>
      </div>
    `;
  }

  // Test method for debugging
  static async testConnection(): Promise<boolean> {
    console.log('🧪 ทดสอบการเชื่อมต่อ Gmail...');
    console.log('📧 อีเมล:', process.env.EMAIL_USER);
    console.log('🔑 App Password:', process.env.EMAIL_PASSWORD ? '✅ ตั้งค่าแล้ว' : '❌ ไม่ได้ตั้งค่า');
    console.log('🔐 Password length:', process.env.EMAIL_PASSWORD?.length || 0);
    console.log('🔐 Password (first 4 chars):', process.env.EMAIL_PASSWORD?.substring(0, 4) || 'N/A');
    
    // ตรวจสอบว่า credentials มีครบหรือไม่
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('❌ ขาด credentials');
      return false;
    }
    
    try {
      console.log('\n🔄 ทดสอบการเชื่อมต่อ Gmail...');
      
      // สร้าง transporter ใหม่พร้อม debug
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        debug: true, // เปิด debug
        logger: true // เปิด logger
      });
      
      await testTransporter.verify();
      console.log('✅ เชื่อมต่อ Gmail สำเร็จ!');
      
      // อัพเดท transporter หลัก
      this.transporter = testTransporter;
      return true;
    } catch (error) {
      console.log('❌ การเชื่อมต่อ Gmail ล้มเหลว:', (error as Error).message);
      
      // ตรวจสอบข้อผิดพลาดทั่วไป
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Invalid login')) {
        console.log('💡 แนะนำ: ตรวจสอบ App Password ใน Gmail');
        console.log('💡 ไปที่: https://myaccount.google.com/apppasswords');
      } else if (errorMessage.includes('Username and Password not accepted')) {
        console.log('💡 แนะนำ: อาจต้องเปิด 2-Factor Authentication ก่อน');
        console.log('💡 ไปที่: https://myaccount.google.com/security');
      } else if (errorMessage.includes('Missing credentials')) {
        console.log('💡 แนะนำ: ตรวจสอบ .env file ว่ามี EMAIL_USER และ EMAIL_PASSWORD หรือไม่');
      }
      
      return false;
    }
  }
}
