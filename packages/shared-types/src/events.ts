export type WidgetEventName =
  | 'widget_loaded'
  | 'widget_rendered'
  | 'interaction'
  | 'submission_ok'
  | 'submission_err'
  | 'error_embed'
  | 'error_backend';

export interface WidgetEventEnvelope<T = unknown> {
  event_name: WidgetEventName;
  event_id: string;        // uuid
  ts: number;              // ms epoch
  workspace_id: string;    // uuid
  widget_id: string;       // uuid
  token_id?: string;       // uuid
  cfg_version?: string;
  embed_version?: string;
  client_run_id?: string;  // uuid per page view
  page_origin_hash?: string; // sha256(origin+path)
  payload?: T;             // non-PII only
}

export type StudioEvent =
  | { type: 'widget:selected'; widgetId: string }
  | { type: 'preview:state'; route: string }
  | { type: 'variant:toggle'; widgetId: string; variant: string; enabled: boolean }
  | { type: 'preview:update'; widgetId: string; cfg: unknown };

export interface StudioEventBus {
  emit(event: StudioEvent): void;
  on<T extends StudioEvent>(handler: (event: T) => void): () => void;
}

export function isStudioEvent(x: any): x is StudioEvent {
  return x && typeof x.type === 'string' && x.type.indexOf(':') > 0;
}

export const PREVIEW_MESSAGE_PREFIX = 'ckeen:preview:';


