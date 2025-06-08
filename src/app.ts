import express from 'express';
import cors from 'cors';
import passport from './config/passport.config';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import placeTypeRoutes from './routes/placeType.routes';
import placeRoutes from './routes/place.routes';
import postRoutes from './routes/post.routes';
import provinceRoutes from './routes/province.routes';
import weatherRoutes from './routes/weatherRoutes';
import weatherScoreRoutes from './routes/weatherScoreRoutes';
import aqiRoutes from './routes/aqiRoutes';
import uploadRoutes from './routes/upload.Routes';
import searchRoutes from './routes/search.routes';
import { errorHandler } from './middleware/error.middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/place-types', placeTypeRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/weather', weatherScoreRoutes); // Weather Scoring System routes
app.use('/api/aqi', aqiRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;
