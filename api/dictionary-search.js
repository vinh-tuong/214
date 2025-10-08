export const config = { runtime: 'nodejs' };

import { ensureHanzi } from './_utils/hanzi.js';
import { withCors, cache, json } from './_utils/http.js';

export default function handler(req, res) {
  withCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });

  const text = (req.query?.text || '').toString().trim();
  if (!text) return json(res, 400, { error: 'Provide `text` (string to search in dictionary)' });

  const mode = (req.query?.mode || 'all').toString().trim();
  if (!['all', 'only'].includes(mode)) return json(res, 400, { error: 'Invalid `mode` (all|only)' });

  try {
    const Hanzi = ensureHanzi();
    const results = Hanzi.dictionarySearch(text, mode) || [];
    
    cache(res, 43200); // 12h, dictionary results rarely change
    return json(res, 200, { 
      text, 
      mode, 
      results,
      count: results.length
    });
  } catch (e) {
    return json(res, 500, { error: 'dictionary_search_failed', message: String(e) });
  }
}
