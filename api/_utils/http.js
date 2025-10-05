// api/_utils/http.js
export function withCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function cache(res, seconds = 86400) { // 1 day
  res.setHeader('Cache-Control', `s-maxage=${seconds}, stale-while-revalidate=604800`);
}

export function json(res, status, data) {
  res.status(status).json(data);
}
