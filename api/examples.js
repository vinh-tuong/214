export const config = { runtime: 'nodejs' };

import { ensureHanzi } from './_utils/hanzi.js';
import { withCors, cache, json } from './_utils/http.js';

export default function handler(req, res) {
  withCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });

  const ch = (req.query?.char || '').toString().trim();
  
  if ([...ch].length !== 1) return json(res, 400, { error: 'Provide exactly one character in `char`' });

  try {
    const Hanzi = ensureHanzi();
    const examples = Hanzi.getExamples(ch) || [];
    
    cache(res, 43200); // 12h, examples rarely change
    return json(res, 200, { char: ch, examples });
  } catch (e) {
    return json(res, 500, { error: 'examples_failed', message: String(e) });
  }
}
