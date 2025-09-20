import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/authRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import metaRoutes from './routes/metaRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

// Import middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_CORS_ORIGINS || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static serving for uploaded files (e.g., resumes)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('AI-Allocation Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/profile', profileRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
