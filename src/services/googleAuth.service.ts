import { OAuth2Client } from 'google-auth-library';
import { PrismaClient, RoleType } from '@prisma/client';
import { AuthService } from './auth.service';

const prisma = new PrismaClient();

export class GoogleAuthService {
  private static client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  static async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      return {
        email: payload.email!,
        name: payload.name!,
        given_name: payload.given_name!,
        family_name: payload.family_name!,
        picture: payload.picture!,
        email_verified: payload.email_verified!,
        google_id: payload.sub!
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  static async loginOrRegisterWithGoogle(googleData: {
    email: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email_verified: boolean;
    google_id: string;
  }) {
    try {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: googleData.email },
        include: { role: true }
      });

      if (user) {
        // User exists, update Google ID if not set
        if (!user.google_id) {
          user = await prisma.user.update({
            where: { id_user: user.id_user },
            data: { 
              google_id: googleData.google_id,
              is_verified: true // Google accounts are verified
            },
            include: { role: true }
          });
        }
      } else {
        // User doesn't exist, create new user
        const defaultRole = await prisma.role.findFirst({
          where: { role_name: RoleType.USER }
        });

        if (!defaultRole) {
          throw new Error('Default role not found');
        }

        // Generate username from email
        const baseUsername = googleData.email.split('@')[0];
        let username = baseUsername;
        
        // Check if username exists and generate unique one
        let counter = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        user = await prisma.user.create({
          data: {
            email: googleData.email,
            username,
            first_name: googleData.given_name,
            last_name: googleData.family_name,
            display_name: googleData.name,
            google_id: googleData.google_id,
            is_verified: true, // Google accounts are verified
            password: '', // No password for Google OAuth users
            role_id: defaultRole.id_role
          },
          include: { role: true }
        });
      }

      // Generate JWT token
      const token = AuthService.generateJWT(user);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
        isNewUser: !user.created_at || 
          (new Date().getTime() - new Date(user.created_at).getTime()) < 5000 // Less than 5 seconds ago
      };
    } catch (error) {
      console.error('Google OAuth login/register error:', error);
      throw new Error('Google authentication failed');
    }
  }
}
