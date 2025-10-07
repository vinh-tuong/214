export const config = { runtime: 'nodejs' };

import { ensureHanzi } from './_utils/hanzi.js';
import { withCors, cache, json } from './_utils/http.js';

export default function handler(req, res) {
  withCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });

  const text = (req.query?.text || '').toString();
  const variant = ((req.query?.variant || 's').toString().trim() || 's');
  
  if (!text) return json(res, 400, { error: 'Provide `text` (string of characters)' });
  if (!['s','t'].includes(variant)) return json(res, 400, { error: 'Invalid `variant` (s|t)' });

  try {
    const Hanzi = ensureHanzi();
    const result = {};
    
    for (const ch of [...text]) {
      const entries = Hanzi.definitionLookup(ch, variant) || [];
      result[ch] = entries;
    }
    
    cache(res, 43200); // 12h, defs rarely change
    return json(res, 200, { text, variant, result });
  } catch (e) {
    return json(res, 500, { error: 'define_many_failed', message: String(e) });
  }
}
