import { PrismaClient, Prisma, RoleType } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { EmailService } from './email.service';

const prisma = new PrismaClient();

export class AuthService {
  // Constants for validation
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
  private static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[a-zA-Z\d@#$%^&*!]{8,}$/;
  private static readonly SALT_ROUNDS = 12;
  private static readonly RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

  // Validation methods
  private static validateInput(email: string, password: string, username?: string): void {
    if (!email || !password || (username !== undefined && !username)) {
      throw new Error('All required fields must be provided');
    }

    if (!this.EMAIL_REGEX.test(email)) {
      throw new Error('Invalid email format');
    }

    if (username && !this.USERNAME_REGEX.test(username)) {
      throw new Error('Username must be 3-20 characters long and can only contain letters, numbers, and underscores');
    }

    if (!this.PASSWORD_REGEX.test(password)) {
      throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&*!)');
    }
  }

  // Hash password with higher salt rounds
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateJWT(user: any): string {
    const payload = {
      id_user: user.id_user,
      email: user.email,
      username: user.username,
      role: user.role?.role_name || 'USER'
    };
    return jwt.sign(payload, process.env.JWT_SECRET!, { 
      expiresIn: '7d',
      issuer: 'weather-app',
      audience: 'weather-app-users'
    });
  }

  // Register user (optimized with single transaction)
  static async register(email: string, password: string, username: string, role = RoleType.USER) {
    // Validate input
    this.validateInput(email, password, username);

    // Check if user exists and get default role in parallel
    const [existingUser, defaultRole] = await Promise.all([
      prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }]
        },
        select: { id_user: true }
      }),
      prisma.role.findFirst({
        where: { role_name: role },
        select: { id_role: true }
      })
    ]);

    if (existingUser) {
      throw new Error('User already exists');
    }

    if (!defaultRole) {
      throw new Error('Default role not found');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user with include to get role data
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role_id: defaultRole.id_role
      },
      include: {
        role: true
      }
    });

    // Send welcome email (non-blocking)
    try {
      // await EmailService.sendWelcomeEmail(user);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Continue - welcome email is not critical
    }

    // Generate token
    const token = this.generateJWT(user);

    return {
      user: {
        id_user: user.id_user,
        email: user.email,
        username: user.username,
        role: user.role.role_name
      },
      token
    };
  }

  // Login user (optimized)
  static async login(username: string, password: string) {
    // this.validateInput(username, password);

    // Find user with role in single query
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true }
    });

    if (!user || !(await this.comparePassword(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateJWT(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  // Forgot password (optimized)
  static async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id_user: true,
        email: true,
        username: true
      }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.RESET_TOKEN_EXPIRY);

    // Delete old unused tokens and create new one in transaction
    await prisma.$transaction([
      prisma.passwordReset.deleteMany({
        where: {
          user_id: user.id_user,
          used: false
        }
      }),
      prisma.passwordReset.create({
        data: {
          user_id: user.id_user,
          token: resetToken,
          expires_at: expiresAt
        }
      })
    ]);

    // Send email with reset token
    try {
      console.log('🔑 PASSWORD RESET TOKEN GENERATED:');
      console.log('==================================');
      console.log('Email:', user.email);
      console.log('Token:', resetToken);
      console.log('Expires at:', expiresAt);
      console.log('==================================');
      
      await EmailService.sendPasswordResetEmail(user.email, user.username, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Continue silently - user will still see success message for security
    }
  }

  // Reset password (optimized)
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      console.log('🔍 Starting resetPassword with token:', token.substring(0, 10) + '...');
      
      // Validate password first
      this.validateInput('dummy@email.com', newPassword);
      
      // หา reset token ในฐานข้อมูล
      const resetRecord = await prisma.passwordReset.findFirst({
        where: {
          token,
          used: false,
          expires_at: {
            gt: new Date()
          }
        },
        include: {
          user: true // ต้องมี include user เพื่อดึงข้อมูล user มาด้วย
        }
      });

      console.log('📝 Reset record found:', !!resetRecord);
      console.log('👤 User in record:', !!resetRecord?.user);

      if (!resetRecord) {
        throw new Error('Invalid or expired reset token');
      }

      if (!resetRecord.user) {
        throw new Error('User not found for this reset token');
      }

      console.log('✅ User found:', resetRecord.user.email);

      // Hash รหัสผ่านใหม่
      const hashedPassword = await this.hashPassword(newPassword);

      // อัพเดตรหัสผ่านและ mark token เป็นใช้แล้วใน transaction
      await prisma.$transaction([
        prisma.user.update({
          where: { id_user: resetRecord.user_id },
          data: { password: hashedPassword }
        }),
        prisma.passwordReset.update({
          where: { id: resetRecord.id },
          data: { used: true }
        })
      ]);

      console.log('🎉 Password reset successfully for user:', resetRecord.user.email);
      
    } catch (error) {
      console.error('❌ Error in resetPassword:', error);
      throw new Error('Error resetting password: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  // Verify reset token
  static async verifyResetToken(token: string): Promise<boolean> {
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        expires_at: { gt: new Date() },
        used: false
      },
      select: { id: true }
    });

    return !!resetRecord;
  }

  // Change password (optimized)
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    this.validateInput('dummy@email.com', newPassword); // Validate new password only

    const user = await prisma.user.findUnique({
      where: { id_user: userId },
      select: { password: true }
    });

    if (!user || !(await this.comparePassword(currentPassword, user.password))) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id_user: userId },
      data: { password: hashedPassword }
    });
  }

  // Verify JWT token
  static async verifyToken(token: string) {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      // Get fresh user data from database
      const user = await prisma.user.findUnique({
        where: { id_user: decoded.id_user },
        // include: { role: true },
        select: {
          id_user: true,
          email: true,
          username: true,
          role: {
            select: {
              role_name: true
            }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        user,
        tokenInfo: {
          id_user: decoded.id_user,
          email: decoded.email,
          username: decoded.username,
          role: decoded.role,
          iat: decoded.iat,
          exp: decoded.exp,
          iss: decoded.iss,
          aud: decoded.aud
        }
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Update user profile
  static async updateProfile(userId: string, profileData: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    phonenumber?: string;
  }): Promise<any> {
    try {
      // Validate input - only allow updating specific fields
      const allowedFields = ['first_name', 'last_name', 'display_name', 'phonenumber'];
      const updateData: any = {};

      // Filter only allowed fields and non-empty values
      for (const [key, value] of Object.entries(profileData)) {
        if (allowedFields.includes(key) && value !== undefined && value !== null) {
          updateData[key] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id_user: userId },
        data: updateData,
        select: {
          id_user: true,
          username: true,
          email: true,
          first_name: true,
          last_name: true,
          display_name: true,
          phonenumber: true,
          is_verified: true,
          created_at: true,
          updated_at: true,
          role: {
            select: {
              id_role: true,
              role_name: true
            }
          }
        }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Error updating profile: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
}