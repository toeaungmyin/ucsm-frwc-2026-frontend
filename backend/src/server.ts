import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import { authRoutes, candidatesRoutes, categoriesRoutes, ticketRoutes } from './modules/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/admin', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/candidates/', candidatesRoutes);
app.use('/api/tickets/', ticketRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
});

