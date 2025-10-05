export const config = { runtime: 'nodejs' };

import { ensureHanzi } from './_utils/hanzi.js';
import { withCors, cache, json } from './_utils/http.js';

export default function handler(req, res) {
  withCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });

  const ch = (req.query?.char || '').toString().trim();
  const variant = ((req.query?.variant || 's').toString().trim() || 's');
  if ([...ch].length !== 1) return json(res, 400, { error: 'Provide exactly one character in `char`' });
  if (!['s','t'].includes(variant)) return json(res, 400, { error: 'Invalid `variant` (s|t)' });

  try {
    const Hanzi = ensureHanzi();
    const entries = Hanzi.definitionLookup(ch, variant) || [];
    cache(res, 43200); // 12h, defs rarely change
    return json(res, 200, { char: ch, variant, entries });
  } catch (e) {
    return json(res, 500, { error: 'define_failed', message: String(e) });
  }
}
