import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';

const prisma = new PrismaClient();

// Local Strategy for login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const result = await AuthService.login(email, password);
        return done(null, result);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// JWT Strategy for protected routes
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.id }
        });

        if (user) {
          return done(null, {
            id: user.id,
            email: user.email,
            name: user.name
          });
        }

        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;