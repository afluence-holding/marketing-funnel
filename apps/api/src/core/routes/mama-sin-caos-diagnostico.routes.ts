import { Router } from 'express';
import { listMamaSinCaosDiagnosticoForTable } from '../services/mama-sin-caos-diagnostico.service';

// Panel interno de respuestas del diagnóstico de Mamá Sin Caos.
// Lee desde `marketing.leads` + `custom_field_values` (ruta genérica de ingesta).
// NO confundir con `/mama-sin-caos/leads` (lista secreta → tabla dedicada).

const router = Router();

const VIEW_TOKEN = process.env.MAMA_SIN_CAOS_VIEW_TOKEN ?? '';

function isAuthorized(req: {
  query: Record<string, unknown>;
  get: (name: string) => string | undefined;
}) {
  if (!VIEW_TOKEN) return true;

  const tokenFromQuery = String(req.query.token ?? '');
  const tokenFromHeader = req.get('x-view-token') ?? '';

  return tokenFromQuery === VIEW_TOKEN || tokenFromHeader === VIEW_TOKEN;
}

router.get('/mama-sin-caos/diagnostico/responses', async (req, res, next) => {
  try {
    if (!isAuthorized(req)) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    const payload = await listMamaSinCaosDiagnosticoForTable();
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
});

export default router;
