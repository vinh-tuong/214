export const config = { runtime: 'nodejs' };

import { ensureHanzi } from './_utils/hanzi.js';
import { withCors, cache, json } from './_utils/http.js';

export default function handler(req, res) {
  withCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });

  const q = (req.query?.q || '').toString().trim();
  const mode = (req.query?.mode || '').toString().trim(); // 'only' | ''
  if (!q) return json(res, 400, { error: 'Provide `q`' });

  try {
    const Hanzi = ensureHanzi();
    const results = Hanzi.dictionarySearch(q, mode === 'only' ? 'only' : null) || [];
    cache(res, 43200);
    return json(res, 200, { q, mode: mode === 'only' ? 'only' : 'all', results });
  } catch (e) {
    return json(res, 500, { error: 'search_failed', message: String(e) });
  }
}
