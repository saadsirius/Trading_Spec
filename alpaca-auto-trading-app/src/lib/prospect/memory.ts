type Prospect = { when: string; intent: string; expectedImpact: number };
const storeProspects = new Map<string, Prospect[]>();

export function rememberProspect(email: string, p: Prospect) {
  const cur = storeProspects.get(email) || [];
  cur.push(p); 
  storeProspects.set(email, cur.slice(-100));
}

export function listProspects(email: string) { 
  return storeProspects.get(email) || []; 
}
