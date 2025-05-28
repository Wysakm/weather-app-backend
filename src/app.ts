import express from 'express';
import cors from 'cors';
import passport from './config/passport.config';
import authRoutes from './routes/auth.routes';
import placeTypeRoutes from './routes/placeType.routes';
import placeRoutes from './routes/place.routes';
import weatherRoutes from './routes/weatherRoutes';
import aqiRoutes from './routes/aqiRoutes';
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
app.use('/api/auth', authRoutes);
app.use('/api/place-types', placeTypeRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/aqi', aqiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;