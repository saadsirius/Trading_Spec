type Handler<T = any> = (p: T) => void;
const listeners = new Map<string, Set<Handler>>();

export function on<T = any>(evt: string, fn: Handler<T>) { 
  const s = listeners.get(evt) || new Set(); 
  s.add(fn as any); 
  listeners.set(evt, s); 
  return () => s.delete(fn as any); 
}

export function emit<T = any>(evt: string, data: T) { 
  listeners.get(evt)?.forEach(fn => fn(data)); 
}

export function once<T = any>(evt: string, fn: Handler<T>) { 
  const off = on(evt, (d: any) => { 
    off(); 
    fn(d); 
  }); 
}
