export const config = { runtime: 'nodejs' };

import { ensureHanzi } from './_utils/hanzi.js';
import { withCors, cache, json } from './_utils/http.js';

export default function handler(req, res) {
  withCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });

  const ch = (req.query?.ch || '').toString().trim();
  const levelStr = (req.query?.level || '').toString().trim();
  const level = levelStr ? Number(levelStr) : undefined;

  if ([...ch].length !== 1) return json(res, 400, { error: 'Provide exactly one CJK character in `ch`' });
  if (level && ![1,2,3].includes(level)) return json(res, 400, { error: 'Invalid `level` (1|2|3)' });

  try {
    const Hanzi = ensureHanzi();
    if (level) {
      const out = Hanzi.decompose(ch, level); // { character, components: [...] }
      cache(res);
      return json(res, 200, { ch, level, components: out?.components ?? [] });
    }
    // all levels
    const once = Hanzi.decompose(ch, 1)?.components ?? [];
    const radical = Hanzi.decompose(ch, 2)?.components ?? [];
    const graphical = Hanzi.decompose(ch, 3)?.components ?? [];
    cache(res);
    return json(res, 200, { ch, components1: once, components2: radical, components3: graphical });
  } catch (e) {
    return json(res, 500, { error: 'decompose_failed', message: String(e) });
  }
}