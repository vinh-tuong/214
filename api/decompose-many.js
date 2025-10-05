export const config = { runtime: 'nodejs' };

import { ensureHanzi } from './_utils/hanzi.js';
import { withCors, cache, json } from './_utils/http.js';

export default function handler(req, res) {
  withCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });

  const text = (req.query?.text || '').toString();
  const levelStr = (req.query?.level || '').toString().trim();
  const level = levelStr ? Number(levelStr) : 2; // default to level 2

  if (!text) return json(res, 400, { error: 'Provide `text` (string of characters)' });
  if (![1,2,3].includes(level)) return json(res, 400, { error: 'Invalid `level` (1|2|3)' });

  try {
    const Hanzi = ensureHanzi();
    const result = {};
    for (const ch of [...text]) {
      const out = Hanzi.decompose(ch, level);
      result[ch] = out?.components ?? [];
    }
    cache(res);
    return json(res, 200, { level, result });
  } catch (e) {
    return json(res, 500, { error: 'decompose_many_failed', message: String(e) });
  }
}
