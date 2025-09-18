export function makeLRU<K, V>(max = 200) {
  const m = new Map<K, V>();
  return {
    get(k: K) { 
      if (!m.has(k)) return; 
      const v = m.get(k)!; 
      m.delete(k); 
      m.set(k, v); 
      return v; 
    },
    set(k: K, v: V) { 
      if (m.has(k)) m.delete(k); 
      m.set(k, v); 
      if (m.size > max) { 
        const f = m.keys().next().value; 
        m.delete(f); 
      } 
    },
    has: (k: K) => m.has(k)
  };
}
