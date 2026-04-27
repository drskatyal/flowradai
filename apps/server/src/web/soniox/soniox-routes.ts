import { Router, Request, Response } from 'express';

const router = Router();

/**
 * POST /soniox/temporary-key
 *
 * Exchanges the server-side SONIOX_API_KEY for a short-lived (1 h) client key.
 * Used by the lite build (and optionally the Next.js client) to avoid exposing
 * the master key in the browser.  The Next.js client previously called the
 * /api/get-temporary-api-key Next.js Route Handler; this endpoint is the
 * Express equivalent so the single-file lite build can reach it.
 */
router.post('/temporary-key', async (_req: Request, res: Response) => {
  const apiKey = process.env.SONIOX_API_KEY;

  if (!apiKey) {
    res.status(400).json({ error: 'SONIOX_API_KEY is not configured on the server' });
    return;
  }

  try {
    const upstream = await fetch('https://api.soniox.com/v1/auth/temporary-api-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        usage_type: 'transcribe_websocket',
        expires_in_seconds: 3600,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      res.status(upstream.status).json({ error: text });
      return;
    }

    const data = await upstream.json();
    res.json({ apiKey: data.api_key });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Failed to fetch temporary API key' });
  }
});

export default router;
