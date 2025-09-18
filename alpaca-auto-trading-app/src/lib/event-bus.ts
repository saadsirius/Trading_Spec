import { createNanoEvents } from "nanoevents";
import type { DomainEvent } from "@/core/domain";

/**
 * Bus d'événements unique (UI et services partagent les mêmes events).
 * On peut enregistrer/rejouer les events pour tests & backtests UI.
 */
type Bus = {
  emit: (e: DomainEvent) => void;
  on: (cb: (e: DomainEvent) => void) => () => void;
  /** Enregistre chaque event en JSONL (string[] in-memory) pour replays */
  recorder: {
    isRecording: boolean;
    buffer: string[];
    start: () => void;
    stop: () => string[];
    clear: () => void;
  };
};

const emitter = createNanoEvents<{ event: (e: DomainEvent) => void }>();

const recorder = {
  isRecording: false,
  buffer: [] as string[],
  start() { this.isRecording = true; },
  stop() { this.isRecording = false; return [...this.buffer]; },
  clear() { this.buffer.length = 0; },
};

export const bus: Bus = {
  emit(e) {
    if (recorder.isRecording) recorder.buffer.push(JSON.stringify(e));
    emitter.emit("event", e);
  },
  on(cb) {
    const off = emitter.on("event", cb);
    return () => off();
  },
  recorder,
};

/** Rejoue un array JSONL d'événements DomainEvent (offline/test) */
export const replay = async (lines: string[], delayMs = 0) => {
  for (const line of lines) {
    const e = JSON.parse(line);
    bus.emit(e);
    if (delayMs) await new Promise(r => setTimeout(r, delayMs));
  }
};
