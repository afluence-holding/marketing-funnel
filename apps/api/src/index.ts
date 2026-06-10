import express from 'express';
import cors from 'cors';
import { env } from '@marketing-funnel/config';
import { errorHandler } from './core/middleware/error-handler';
import ingestionRoutes from './core/routes/ingestion.routes';
import leadsRoutes from './core/routes/leads.routes';
import elevenLabsRoutes from './core/routes/elevenlabs.routes';
import { whopWebhookHandler } from './core/routes/whop.routes';
import { startAll as startCron, getRegisteredJobs } from './core/cron';
import { startWorkflowEngine } from './core/engine/workflow-engine';
import enrollmentRoutes from './core/routes/enrollment.routes';
import bukkuLeadsRoutes from './core/routes/bukku-leads.routes';
import mamaSinCaosLeadsRoutes from './core/routes/mama-sin-caos-leads.routes';
import caroFitnessProgressRoutes from './core/routes/caro-fitness-progress.routes';
import germanRozProgressRoutes from './core/routes/german-roz-progress.routes';
import whatsappGroupsRoutes from './core/routes/whatsapp-groups.routes';
import hotmartRoutes from './core/routes/hotmart.routes';
import { ensureBukkuLeadsTable } from './core/bootstrap/ensure-bukku-leads-table';
import { ensureMamaSinCaosLeadsTable } from './core/bootstrap/ensure-mama-sin-caos-leads-table';
import { ensureCaroFitnessProgressTable } from './core/bootstrap/ensure-caro-fitness-progress-table';
import { ensureGermanRozProgressTable } from './core/bootstrap/ensure-german-roz-progress-table';
import { ensureWhatsAppGroupTables } from './core/bootstrap/ensure-whatsapp-group-tables';
import { ensurePurchaseTables } from './core/bootstrap/ensure-purchase-tables';
import { ensureHotmartEventsTable } from './core/bootstrap/ensure-hotmart-events-table';
import { seedWhatsAppGroupPools } from './core/services/whatsapp-group-rotation.service';
import { syncCohortsFromCatalog } from './core/services/cohort-sync.service';
import { whatsappGroupPoolRegistry } from './orgs';

const app = express();

app.use(cors());

// Whop Standard Webhooks require the raw body for signature verification.
app.post(
  '/api/whop/webhook',
  express.raw({ type: 'application/json' }),
  whopWebhookHandler,
);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, cron: getRegisteredJobs() });
});

app.use('/api', ingestionRoutes);
app.use('/api', leadsRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', bukkuLeadsRoutes);
app.use('/api', mamaSinCaosLeadsRoutes);
app.use('/api', caroFitnessProgressRoutes);
app.use('/api', germanRozProgressRoutes);
app.use('/api', whatsappGroupsRoutes);
app.use('/api', hotmartRoutes);
app.use('/api/elevenlabs', elevenLabsRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  void ensureBukkuLeadsTable().catch((error) => {
    console.error('[bukku] failed to ensure bukku_leads table', error);
  });
  void ensureMamaSinCaosLeadsTable().catch((error) => {
    console.error('[mama-sin-caos] failed to ensure mama_sin_caos_leads table', error);
  });
  void ensureCaroFitnessProgressTable().catch((error) => {
    console.error('[caro-fitness] failed to ensure caro_fitness_progress table', error);
  });
  void ensureGermanRozProgressTable().catch((error) => {
    console.error('[german-roz] failed to ensure german_roz_progress table', error);
  });
  void ensureWhatsAppGroupTables()
    .then(() => seedWhatsAppGroupPools(whatsappGroupPoolRegistry))
    .catch((error) => {
      console.error('[whatsapp-groups] failed to ensure/seed whatsapp group tables', error);
    });
  void ensurePurchaseTables()
    .then(() => syncCohortsFromCatalog())
    .catch((error) => {
      console.error('[purchases] failed to ensure/sync cohort+purchase tables', error);
    });
  void ensureHotmartEventsTable().catch((error) => {
    console.error('[hotmart] failed to ensure webhook events table', error);
  });
  startWorkflowEngine();
  startCron();
  console.log(`API running on http://localhost:${env.PORT}`);
});
