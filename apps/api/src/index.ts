import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (_req, res) => {
  res.json({ message: 'Food Delivery API', version: '1.0.0' });
});

// Routes
app.use('/auth', authRoutes);

// Placeholder for future routes
app.get('/menu', (_req, res) => {
  res.json([
    { id: 1, name: 'Margherita Pizza', price: 299, category: 'Pizza', available: true },
    { id: 2, name: 'Pasta Alfredo', price: 249, category: 'Pasta', available: true },
    { id: 3, name: 'Caesar Salad', price: 199, category: 'Salad', available: true },
  ]);
});

const PORT = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export { app };