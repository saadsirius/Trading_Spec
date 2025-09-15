import { NextResponse } from 'next/server';
import { SSEEvent } from './types/overview';

// Connection registry to track active SSE connections
const connections = new Map<string, Set<ReadableStreamDefaultController>>();

export function addSSEConnection(userId: string, mode: 'paper' | 'live', controller: ReadableStreamDefaultController) {
  const key = `${userId}:${mode}`;
  if (!connections.has(key)) {
    connections.set(key, new Set());
  }
  connections.get(key)!.add(controller);
}

export function removeSSEConnection(userId: string, mode: 'paper' | 'live', controller: ReadableStreamDefaultController) {
  const key = `${userId}:${mode}`;
  const userConnections = connections.get(key);
  if (userConnections) {
    userConnections.delete(controller);
    if (userConnections.size === 0) {
      connections.delete(key);
    }
  }
}

export function broadcastToUser(userId: string, mode: 'paper' | 'live', event: SSEEvent) {
  const key = `${userId}:${mode}`;
  const userConnections = connections.get(key);
  
  if (userConnections) {
    const message = formatSSEMessage(event.type, JSON.stringify(event.data));
    
    for (const controller of Array.from(userConnections)) {
      try {
        controller.enqueue(new TextEncoder().encode(message));
      } catch (error) {
        console.error('Error sending SSE message:', error);
        userConnections.delete(controller);
      }
    }
  }
}

export function formatSSEMessage(event: string, data: string): string {
  return `event: ${event}\ndata: ${data}\n\n`;
}

export function createSSEStream(userId: string, mode: 'paper' | 'live') {
  return new ReadableStream({
    start(controller) {
      addSSEConnection(userId, mode, controller);
      
      // Send initial ping
      const pingMessage = formatSSEMessage('ping', JSON.stringify({ timestamp: new Date().toISOString() }));
      controller.enqueue(new TextEncoder().encode(pingMessage));
      
      // Set up heartbeat
      const heartbeat = setInterval(() => {
        try {
          const pingMessage = formatSSEMessage('ping', JSON.stringify({ timestamp: new Date().toISOString() }));
          controller.enqueue(new TextEncoder().encode(pingMessage));
        } catch (error) {
          clearInterval(heartbeat);
          removeSSEConnection(userId, mode, controller);
        }
      }, 15000);
      
      // Note: Cleanup would be handled by the request abort signal in a real implementation
    },
    
    cancel() {
      removeSSEConnection(userId, mode, this as any);
    }
  });
}

export function getSSEHeaders() {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  };
}

// Rate limiting utilities
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export function getRateLimitHeaders(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    return {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': (limit - 1).toString(),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
    };
  }

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': (limit - record.count).toString(),
    'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
  };
}
