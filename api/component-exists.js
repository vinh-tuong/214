export const config = { runtime: 'nodejs' };

import { ensureHanzi } from './_utils/hanzi.js';
import { withCors, cache, json } from './_utils/http.js';

export default function handler(req, res) {
  withCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });

  const comp = (req.query?.component || '').toString().trim();
  if ([...comp].length !== 1) return json(res, 400, { error: 'Provide exactly one component char in `component`' });

  try {
    const Hanzi = ensureHanzi();
    const exists = Hanzi.ifComponentExists(comp);
    cache(res);
    return json(res, 200, { component: comp, exists });
  } catch (e) {
    return json(res, 500, { error: 'component_exists_failed', message: String(e) });
  }
}
