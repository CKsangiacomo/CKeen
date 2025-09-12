import { StudioEvent, StudioEventListener } from './types';

export class StudioEventBus extends EventTarget {
  emit(event: StudioEvent) {
    this.dispatchEvent(new CustomEvent(event.type, { detail: event }));
  }

  on(fn: StudioEventListener) {
    const handler = (ev: Event) => fn((ev as CustomEvent).detail as StudioEvent);
    const types: Array<StudioEvent['type']> = [
      'studio:ready',
      'studio:panel',
      'studio:theme',
      'studio:viewport',
      'studio:error',
    ];
    types.forEach(t => this.addEventListener(t, handler));
    return () => types.forEach(t => this.removeEventListener(t, handler));
  }
}

export const studioBus = new StudioEventBus();
