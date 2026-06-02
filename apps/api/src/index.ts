import express from 'express';
import cors from 'cors';
import { env } from '@marketing-funnel/config';
import { errorHandler } from './core/middleware/error-handler';
import ingestionRoutes from './core/routes/ingestion.routes';
import leadsRoutes from './core/routes/leads.routes';
import elevenLabsRoutes from './core/routes/elevenlabs.routes';
import { startAll as startCron, getRegisteredJobs } from './core/cron';
import { startWorkflowEngine } from './core/engine/workflow-engine';
import enrollmentRoutes from './core/routes/enrollment.routes';
import bukkuLeadsRoutes from './core/routes/bukku-leads.routes';
import { ensureBukkuLeadsTable } from './core/bootstrap/ensure-bukku-leads-table';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, cron: getRegisteredJobs() });
});

app.use('/api', ingestionRoutes);
app.use('/api', leadsRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', bukkuLeadsRoutes);
app.use('/api/elevenlabs', elevenLabsRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  void ensureBukkuLeadsTable().catch((error) => {
    console.error('[bukku] failed to ensure bukku_leads table', error);
  });
  startWorkflowEngine();
  startCron();
  console.log(`API running on http://localhost:${env.PORT}`);
});
