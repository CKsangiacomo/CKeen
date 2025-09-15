import type { StudioEvent, StudioEventBus } from '@ck/shared-types';
import { PREVIEW_MESSAGE_PREFIX } from '@ck/shared-types';

type Handler = (ev: StudioEvent) => void;

export function createBus(): StudioEventBus {
  const handlers = new Set<Handler>();

  function emit(event: StudioEvent) {
    handlers.forEach(h => {
      try { h(event); } catch { /* swallow */ }
    });
  }

  function on<T extends StudioEvent>(handler: (ev: T) => void) {
    const h = handler as Handler;
    handlers.add(h);
    return () => handlers.delete(h);
  }

  // Bridge to preview iframe via postMessage
  if (typeof window !== 'undefined') {
    window.addEventListener('message', (e: MessageEvent) => {
      try {
        const msg = e.data;
        if (!msg || typeof msg !== 'object') return;
        if (!('type' in msg) || typeof (msg as any).type !== 'string') return;
        const type = (msg as any).type as string;
        if (!type.startsWith(PREVIEW_MESSAGE_PREFIX)) return;
        const ev = { ...(msg as object), type: type.replace(PREVIEW_MESSAGE_PREFIX, '') } as StudioEvent;
        emit(ev);
      } catch { /* ignore */ }
    });
  }

  return { emit, on };
}
