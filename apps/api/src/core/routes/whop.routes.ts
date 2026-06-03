import { type Request, type Response, type NextFunction } from 'express';
import { handleWhopWebhookEvent, WhopWebhookError } from '../services/whop-webhook.service';

export async function whopWebhookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString('utf8')
      : typeof req.body === 'string'
        ? req.body
        : '';

    if (!rawBody) {
      res.status(400).json({ error: 'Empty webhook body' });
      return;
    }

    const result = await handleWhopWebhookEvent(rawBody, req.headers);

    res.status(200).json({
      ok: true,
      handled: result.handled,
      type: result.type,
      paymentId: result.paymentId,
    });
  } catch (err) {
    if (err instanceof WhopWebhookError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}
