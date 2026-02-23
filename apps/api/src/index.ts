import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import ingestionRoutes from './routes/ingestion.routes';
import leadsRoutes from './routes/leads.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV });
});

app.use('/api', ingestionRoutes);
app.use('/api', leadsRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});
