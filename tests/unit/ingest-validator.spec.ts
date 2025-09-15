import { describe, it, expect } from 'vitest';
import { __validateEnvelopeForTest as validate } from '../../services/api/app/api/ingest/route';

describe('ingest envelope validator', () => {
  it('accepts minimal valid', () => {
    expect(validate({ event_name: 'widget_loaded', workspace_id: 'w', widget_id: 'i' })).toBe(true);
  });

  it('rejects extra top-level keys', () => {
    expect(validate({ event_name: 'x', workspace_id: 'w', widget_id: 'i', nope: 1 })).toBe(false);
  });

  it('rejects bad types', () => {
    expect(validate({ event_name: 123, workspace_id: 'w', widget_id: 'i' })).toBe(false);
  });

  it('rejects payload with PII-ish keys', () => {
    expect(validate({ event_name: 'x', workspace_id: 'w', widget_id: 'i', payload: { email: 'x@y' } })).toBe(false);
  });

  it('accepts optional fields', () => {
    expect(validate({
      event_name: 'x', workspace_id: 'w', widget_id: 'i',
      event_id: 'e', ts: Date.now(), cfg_version: 'p1', embed_version: 'p1',
      client_run_id: null, page_origin_hash: 'h', token_id: null, payload: { ok: 1 }
    })).toBe(true);
  });
});


