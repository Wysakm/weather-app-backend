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
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      try {
        const result = await AuthService.login(username, password);
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
      console.log(' payload:', payload)
      try {
        const user = await prisma.user.findUnique({
          where: { id_user: payload.id }
        });

        if (user) {
          return done(null, {
            id: user.id_user,
            email: user.email,
            username: user.username
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