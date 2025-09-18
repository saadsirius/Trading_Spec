export async function enrichCompany(symbolOrName: string) {
  // Stubs safe si clés manquent; remonte logo générique + ESG fictif neutre
  try {
    const name = symbolOrName;
    const logoUrl = `https://logo.clearbit.com/${name.toLowerCase()}.com`; // pas garanti
    return { 
      logoUrl, 
      sector: '—', 
      esg: { score: 0.55, grade: 'B' }, 
      marketCap: undefined, 
      pe: undefined, 
      dividendYield: undefined 
    };
  } catch { 
    return { esg: { score: 0.5, grade: '—' } }; 
  }
}

export async function fetchNewsHeadlines(symbol: string) {
  // Branche ta route /api/news?symbol=… si dispo; sinon retourne vide
  try {
    const j = await fetch(`/api/news?symbol=${encodeURIComponent(symbol)}&limit=3`, { cache: 'no-store' }).then(r => r.json());
    return j?.items || [];
  } catch { 
    return []; 
  }
}
