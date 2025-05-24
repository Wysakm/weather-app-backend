import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserPayload {
  id: number;
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
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }

  // Register user
  static async register(email: string, password: string, name?: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // Generate token
    const token = this.generateToken({ id: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  }

  // Login user
  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
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
    const token = this.generateToken({ id: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  }
}