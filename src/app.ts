import express from 'express';
import cors from 'cors';
import passport from './config/passport.config';
import authRoutes from './routes/auth.routes';
import placeTypeRoutes from './routes/placeType.routes';
import placeRoutes from './routes/place.routes';
import provinceRoutes from './routes/province.routes'; // เพิ่ม import นี้
import { errorHandler } from './middleware/error.middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // ต้องมีบรรทัดนี้
app.use(express.urlencoded({ extended: true })); // ต้องมีบรรทัดนี้
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/place-types', placeTypeRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/provinces', provinceRoutes); // เพิ่มบรรทัดนี้

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;