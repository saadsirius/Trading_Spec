import { DomainEvent, EventType, TraceId } from './domain';

// ============================================================================
// EVENT BUS - Architecture orientée événements
// ============================================================================

type EventHandler<T = any> = (event: DomainEvent<T>) => void | Promise<void>;
type EventFilter = (event: DomainEvent) => boolean;

class EventBus {
  private handlers = new Map<EventType, Set<EventHandler>>();
  private globalHandlers = new Set<EventHandler>();
  private replayBuffer: DomainEvent[] = [];
  private maxReplaySize = 10000;
  private isReplayMode = false;

  // ============================================================================
  // CORE METHODS
  // ============================================================================

  /**
   * Subscribe to specific event type
   */
  on<T = any>(eventType: EventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Subscribe to all events
   */
  onAll(handler: EventHandler): () => void {
    this.globalHandlers.add(handler);
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  /**
   * Emit an event
   */
  async emit<T = any>(
    type: EventType, 
    payload: T, 
    source: string = 'unknown',
    traceId?: TraceId
  ): Promise<void> {
    const event: DomainEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      traceId: traceId || crypto.randomUUID(),
      source
    };

    // Add to replay buffer
    this.addToReplayBuffer(event);

    // Emit to specific handlers
    const specificHandlers = this.handlers.get(type);
    if (specificHandlers) {
      for (const handler of specificHandlers) {
        try {
          await handler(event);
        } catch (error) {
          console.error(`[EventBus] Handler error for ${type}:`, error);
        }
      }
    }

    // Emit to global handlers
    for (const handler of this.globalHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`[EventBus] Global handler error:`, error);
      }
    }
  }

  /**
   * Emit event synchronously (for performance-critical paths)
   */
  emitSync<T = any>(
    type: EventType, 
    payload: T, 
    source: string = 'unknown',
    traceId?: TraceId
  ): void {
    const event: DomainEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      traceId: traceId || crypto.randomUUID(),
      source
    };

    this.addToReplayBuffer(event);

    // Emit to specific handlers (sync)
    const specificHandlers = this.handlers.get(type);
    if (specificHandlers) {
      for (const handler of specificHandlers) {
        try {
          handler(event);
        } catch (error) {
          console.error(`[EventBus] Handler error for ${type}:`, error);
        }
      }
    }

    // Emit to global handlers (sync)
    for (const handler of this.globalHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`[EventBus] Global handler error:`, error);
      }
    }
  }

  // ============================================================================
  // REPLAY & TESTING
  // ============================================================================

  /**
   * Add event to replay buffer
   */
  private addToReplayBuffer(event: DomainEvent): void {
    this.replayBuffer.push(event);
    
    // Keep buffer size manageable
    if (this.replayBuffer.length > this.maxReplaySize) {
      this.replayBuffer = this.replayBuffer.slice(-this.maxReplaySize);
    }
  }

  /**
   * Get replay buffer for testing/debugging
   */
  getReplayBuffer(): DomainEvent[] {
    return [...this.replayBuffer];
  }

  /**
   * Clear replay buffer
   */
  clearReplayBuffer(): void {
    this.replayBuffer = [];
  }

  /**
   * Replay events (for testing)
   */
  async replayEvents(filter?: EventFilter): Promise<void> {
    const events = filter 
      ? this.replayBuffer.filter(filter)
      : this.replayBuffer;

    this.isReplayMode = true;
    
    try {
      for (const event of events) {
        // Emit to specific handlers
        const specificHandlers = this.handlers.get(event.type);
        if (specificHandlers) {
          for (const handler of specificHandlers) {
            try {
              await handler(event);
            } catch (error) {
              console.error(`[EventBus] Replay handler error:`, error);
            }
          }
        }

        // Emit to global handlers
        for (const handler of this.globalHandlers) {
          try {
            await handler(event);
          } catch (error) {
            console.error(`[EventBus] Replay global handler error:`, error);
          }
        }
      }
    } finally {
      this.isReplayMode = false;
    }
  }

  /**
   * Check if currently in replay mode
   */
  isInReplayMode(): boolean {
    return this.isReplayMode;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get event statistics
   */
  getStats(): {
    totalEvents: number;
    handlersByType: Record<EventType, number>;
    globalHandlers: number;
    replayBufferSize: number;
  } {
    const handlersByType: Record<EventType, number> = {} as any;
    
    for (const [type, handlers] of this.handlers) {
      handlersByType[type] = handlers.size;
    }

    return {
      totalEvents: this.replayBuffer.length,
      handlersByType,
      globalHandlers: this.globalHandlers.size,
      replayBufferSize: this.replayBuffer.length
    };
  }

  /**
   * Remove all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
    this.replayBuffer = [];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const eventBus = new EventBus();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Emit quote tick event
 */
export const emitQuoteTick = (payload: any, source: string = 'market-data', traceId?: TraceId) => {
  eventBus.emitSync('QUOTE_TICK', payload, source, traceId);
};

/**
 * Emit order event
 */
export const emitOrderEvent = (type: 'ORDER_CREATED' | 'ORDER_FILLED' | 'ORDER_CANCELED', payload: any, source: string = 'trading', traceId?: TraceId) => {
  eventBus.emitSync(type, payload, source, traceId);
};

/**
 * Emit signal event
 */
export const emitSignal = (payload: any, source: string = 'strategy', traceId?: TraceId) => {
  eventBus.emitSync('SIGNAL_GENERATED', payload, source, traceId);
};

/**
 * Emit alert event
 */
export const emitAlert = (payload: any, source: string = 'alerts', traceId?: TraceId) => {
  eventBus.emitSync('ALERT_TRIGGERED', payload, source, traceId);
};

/**
 * Emit system error
 */
export const emitSystemError = (payload: any, source: string = 'system', traceId?: TraceId) => {
  eventBus.emitSync('SYSTEM_ERROR', payload, source, traceId);
};

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useEffect, useRef } from 'react';

/**
 * Hook to subscribe to events
 */
export function useEventBus<T = any>(
  eventType: EventType,
  handler: EventHandler<T>,
  deps: any[] = []
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = eventBus.on(eventType, (event) => {
      handlerRef.current(event);
    });

    return unsubscribe;
  }, [eventType, ...deps]);
}

/**
 * Hook to subscribe to all events
 */
export function useEventBusAll(handler: EventHandler, deps: any[] = []) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = eventBus.onAll((event) => {
      handlerRef.current(event);
    });

    return unsubscribe;
  }, deps);
}
