export type StudioEvent =
  | { type: studio:ready; at: number }
  | { type: studio:panel; side: right; expanded: boolean; source: studio; at: number }
  | { type: studio:theme; theme: light | dark; at: number }
  | { type: studio:viewport; viewport: desktop | mobile; at: number }
  | { type: studio:error; code: string; message: string; at: number };

export type StudioEventListener = (e: StudioEvent) => void;
