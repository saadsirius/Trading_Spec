import pino from 'pino';
import { nanoid } from 'nanoid';

export const log = pino({ 
  level: process.env.LOG_LEVEL || 'info', 
  base: null 
});

export function withReqId(init?: RequestInit): RequestInit {
  const id = nanoid(10);
  return { 
    ...(init || {}), 
    headers: { 
      ...(init?.headers || {}), 
      'x-request-id': id 
    } 
  };
}

export function getReqId(headers: Headers): string { 
  return headers.get('x-request-id') || nanoid(8); 
}
