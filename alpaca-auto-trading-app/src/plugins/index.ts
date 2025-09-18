export type Provider = {
  id: string;
  handles: (path: string) => boolean;
  exec: (req: Request) => Promise<Response>;
};

const registry: Provider[] = [];

export function register(p: Provider): void { 
  registry.push(p); 
}

export function resolve(pathname: string): Provider | undefined { 
  return registry.find(p => p.handles(pathname)); 
}

export function list(): string[] { 
  return registry.map(p => p.id); 
}
