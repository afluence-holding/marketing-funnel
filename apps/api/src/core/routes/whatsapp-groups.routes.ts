import { Router, type Request } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { getBusinessUnitBinding } from '../../orgs';
import {
  addGroup,
  assignGroup,
  getPoolState,
  recordJoin,
  setGroupFull,
} from '../services/whatsapp-group-rotation.service';

const router = Router();

const ADMIN_TOKEN = process.env.WHATSAPP_GROUPS_ADMIN_TOKEN ?? '';
const WEBHOOK_TOKEN = process.env.WHATSAPP_GROUPS_WEBHOOK_TOKEN ?? '';

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

function hasToken(req: Request, expected: string): boolean {
  if (!expected) return true;
  const fromQuery = String(req.query.token ?? '');
  const fromHeader = req.get('x-admin-token') ?? req.get('x-webhook-token') ?? '';
  const bearer = (req.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  return fromQuery === expected || fromHeader === expected || bearer === expected;
}

function resolveBinding(req: Request) {
  const orgKey = firstParam(req.params.orgKey);
  const buKey = firstParam(req.params.buKey);
  if (!orgKey || !buKey) return { error: 'invalid_keys' as const };
  const binding = getBusinessUnitBinding(orgKey, buKey);
  if (!binding) return { error: 'not_found' as const, orgKey, buKey };
  return { orgKey, buKey, binding };
}

const assignSchema = z.object({
  poolKey: z.string().min(1),
  leadId: z.string().uuid().optional(),
  phone: z.string().optional(),
});

router.post(
  '/orgs/:orgKey/bus/:buKey/whatsapp-group/assign',
  validate(assignSchema),
  async (req, res, next) => {
    try {
      const resolved = resolveBinding(req);
      if ('error' in resolved) {
        if (resolved.error === 'invalid_keys') {
          res.status(400).json({ ok: false, error: 'Invalid org or business unit key' });
          return;
        }
        res.status(404).json({ ok: false, error: 'Business unit not found' });
        return;
      }

      const result = await assignGroup({
        orgKey: resolved.orgKey,
        buKey: resolved.buKey,
        poolKey: req.body.poolKey,
        leadId: req.body.leadId,
        phone: req.body.phone,
      });

      if (!result.ok) {
        const status = result.reason === 'pool_not_found' ? 404 : 503;
        res.status(status).json({ ok: false, error: result.reason });
        return;
      }

      res.status(200).json({
        ok: true,
        inviteUrl: result.inviteUrl,
        groupId: result.groupId,
        label: result.label,
        position: result.position,
        reused: result.reused,
        poolExhausted: result.poolExhausted,
      });
    } catch (err) {
      next(err);
    }
  },
);

const joinSchema = z.object({
  groupJid: z.string().min(1),
  phone: z.string().min(1),
});

router.post(
  '/orgs/:orgKey/bus/:buKey/whatsapp-group/join-webhook',
  validate(joinSchema),
  async (req, res, next) => {
    try {
      if (!hasToken(req, WEBHOOK_TOKEN)) {
        res.status(401).json({ ok: false, error: 'Unauthorized' });
        return;
      }
      const resolved = resolveBinding(req);
      if ('error' in resolved) {
        res.status(resolved.error === 'invalid_keys' ? 400 : 404).json({ ok: false, error: resolved.error });
        return;
      }
      const result = await recordJoin({ groupJid: req.body.groupJid, phone: req.body.phone });
      res.status(200).json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/orgs/:orgKey/bus/:buKey/whatsapp-group/state', async (req, res, next) => {
  try {
    if (!hasToken(req, ADMIN_TOKEN)) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }
    const resolved = resolveBinding(req);
    if ('error' in resolved) {
      res.status(resolved.error === 'invalid_keys' ? 400 : 404).json({ ok: false, error: resolved.error });
      return;
    }
    const poolKey = firstParam(req.query.poolKey as string | string[] | undefined);
    if (!poolKey) {
      res.status(400).json({ ok: false, error: 'poolKey is required' });
      return;
    }
    const state = await getPoolState(resolved.orgKey, resolved.buKey, poolKey);
    if (!state) {
      res.status(404).json({ ok: false, error: 'pool_not_found' });
      return;
    }
    res.status(200).json({ ok: true, ...state });
  } catch (err) {
    next(err);
  }
});

const addGroupSchema = z.object({
  poolKey: z.string().min(1),
  label: z.string().min(1),
  inviteUrl: z.string().url(),
  position: z.number().int().positive().optional(),
  groupJid: z.string().optional(),
});

router.post(
  '/orgs/:orgKey/bus/:buKey/whatsapp-group/groups',
  validate(addGroupSchema),
  async (req, res, next) => {
    try {
      if (!hasToken(req, ADMIN_TOKEN)) {
        res.status(401).json({ ok: false, error: 'Unauthorized' });
        return;
      }
      const resolved = resolveBinding(req);
      if ('error' in resolved) {
        res.status(resolved.error === 'invalid_keys' ? 400 : 404).json({ ok: false, error: resolved.error });
        return;
      }
      const group = await addGroup({
        orgKey: resolved.orgKey,
        buKey: resolved.buKey,
        poolKey: req.body.poolKey,
        label: req.body.label,
        inviteUrl: req.body.inviteUrl,
        position: req.body.position,
        groupJid: req.body.groupJid,
      });
      if (!group) {
        res.status(404).json({ ok: false, error: 'pool_not_found' });
        return;
      }
      res.status(201).json({ ok: true, group });
    } catch (err) {
      next(err);
    }
  },
);

const fullSchema = z.object({ isFull: z.boolean().optional() });

router.post(
  '/orgs/:orgKey/bus/:buKey/whatsapp-group/groups/:groupId/full',
  validate(fullSchema),
  async (req, res, next) => {
    try {
      if (!hasToken(req, ADMIN_TOKEN)) {
        res.status(401).json({ ok: false, error: 'Unauthorized' });
        return;
      }
      const groupId = firstParam(req.params.groupId);
      if (!groupId) {
        res.status(400).json({ ok: false, error: 'Invalid group id' });
        return;
      }
      const group = await setGroupFull(groupId, req.body.isFull ?? true);
      if (!group) {
        res.status(404).json({ ok: false, error: 'group_not_found' });
        return;
      }
      res.status(200).json({ ok: true, group });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
