export const config = { runtime: 'nodejs' };

import { ensureHanzi } from './_utils/hanzi.js';
import { withCors, cache, json } from './_utils/http.js';

export default function handler(req, res) {
  withCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });

  const component = (req.query?.component || '').toString().trim();
  
  if ([...component].length !== 1) return json(res, 400, { error: 'Provide exactly one component character in `component`' });

  try {
    const Hanzi = ensureHanzi();
    const characters = Hanzi.getCharactersWithComponent(component) || [];
    
    cache(res, 43200); // 12h, character lists rarely change
    return json(res, 200, { component, characters });
  } catch (e) {
    return json(res, 500, { error: 'characters_from_component_failed', message: String(e) });
  }
}
