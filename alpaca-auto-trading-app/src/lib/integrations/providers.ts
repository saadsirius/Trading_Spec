const POLYGON = 'https://api.polygon.io';
const TRAD_ECO = 'https://api.tradingeconomics.com';
const NEWSAPI = 'https://newsapi.org/v2';
const OPEN_METEO = process.env.OPEN_METEO_BASE || 'https://api.open-meteo.com/v1/forecast';

async function withRetry<T>(fn: () => Promise<T>, tries = 3) { 
  let d = 300; 
  for (let i = 0; i < tries; i++) { 
    try { 
      return await fn(); 
    } catch (e) { 
      if (i === tries - 1) throw e; 
      await new Promise(r => setTimeout(r, d)); 
      d = Math.min(3000, d * 2); 
    } 
  } 
  throw new Error('retry_fail'); 
}

export async function macroNow(country = 'US') {
  const key = `macro:${country}`;
  const { cacheGet, cacheSet, dedup } = await import('@/lib/cache/lru');
  const cached = cacheGet<any>(key); 
  if (cached) return cached;
  
  const data = await dedup(key, () => withRetry(async () => {
    // Exemple: TE GDP & CPI headlines (selon plan)
    const token = process.env.TRADING_ECONOMICS_KEY || '';
    const gdp = await fetch(`${TRAD_ECO}/country/${country}?c=${token}`)
      .then(r => r.json())
      .catch(() => []);
    return { country, gdp };
  }, 3));
  
  cacheSet(key, data, 10 * 60 * 1000);
  return data;
}

export async function newsNow(query = 'markets') {
  const key = `news:${query}`;
  const { cacheGet, cacheSet, dedup } = await import('@/lib/cache/lru');
  const cached = cacheGet<any>(key); 
  if (cached) return cached;
  
  const data = await dedup(key, () => withRetry(async () => {
    const apiKey = process.env.NEWSAPI_KEY || '';
    const url = `${NEWSAPI}/everything?q=${encodeURIComponent(query)}&pageSize=10&sortBy=publishedAt&apiKey=${apiKey}`;
    const j = await fetch(url)
      .then(r => r.json())
      .catch(() => ({ articles: [] }));
    return (j?.articles ?? []).map((a: any) => ({ 
      title: a.title, 
      src: a.source?.name, 
      t: a.publishedAt, 
      url: a.url 
    }));
  }, 3));
  
  cacheSet(key, data, 2 * 60 * 1000);
  return data;
}

export async function weatherSignal(lat = 40.71, lon = -74.0) {
  const key = `weather:${lat.toFixed(2)},${lon.toFixed(2)}`;
  const { cacheGet, cacheSet, dedup } = await import('@/lib/cache/lru');
  const cached = cacheGet<any>(key); 
  if (cached) return cached;
  
  const data = await dedup(key, () => withRetry(async () => {
    const url = `${OPEN_METEO}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7`;
    const j = await fetch(url).then(r => r.json());
    // Saisonnalité simple: météo extrême → flag (impact retail/énergie)
    const hot = Math.max(...(j?.daily?.temperature_2m_max || [0])) > 32;
    const cold = Math.min(...(j?.daily?.temperature_2m_min || [0])) < -5;
    return { hot, cold, raw: j?.daily ?? {} };
  }, 3));
  
  cacheSet(key, data, 30 * 60 * 1000);
  return data;
}
