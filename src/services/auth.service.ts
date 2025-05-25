import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma, RoleType } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserPayload {
  id_user: string;
  email: string;
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static generateToken(user: UserPayload): string {
    return jwt.sign(
      { id: user.id_user, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }

  // Register user
  static async register(email: string, password: string, username: string) {
    // Validate input
    if (!email || !password || !username) {
      throw new Error('Email, password, and username are required');
    }
    // Check if email and username are valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // Alphanumeric and underscores, 3-20 characters
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    if (!usernameRegex.test(username)) {
      throw new Error('Username must be 3-20 characters long and can only contain letters, numbers, and underscores');
    }
    // Check if password is strong enough
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[a-zA-Z\d@#$%^&*!]{8,}$/; // At least 8 characters, one uppercase, one lowercase, one number, one special character
    if (!passwordRegex.test(password)) {
      throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&*!)');
    }
    // Check if user exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });
    if (existingEmail || existingUsername) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    const role = await prisma.role.findFirst({
      where: { role_name: RoleType.USER },
      select: { id_role: true }
    });
    if (!role) {
      throw new Error('Default role not found');
    }
    // Create user
    const userData: Prisma.UserCreateInput = {
      email,
      password: hashedPassword,
      username,
      role: {
        connect: { id_role: role.id_role }
      }
    };
    const user = await prisma.user.create({
      data: userData
    });

    // Generate token
    const token = this.generateToken({ id_user: user.id_user, email: user.email });

    return {
      user: {
        id: user.id_user,
        email: user.email,
        username: user.username
      },
      token
    };
  }

  // Login user
  static async login(username: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await this.comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({ id_user: user.id_user, email: user.email });

    return {
      user: {
        id: user.id_user,
        email: user.email,
        username: user.username
      },
      token
    };
  }
}