type LogFields = Record<string, string | number | boolean | null | undefined>;

function fmt(fields: LogFields) {
  const keys = Object.keys(fields).sort();
  return keys.map(k => `${k}=${String(fields[k])}`).join(' ');
}

/**
 * Structured log line. Never include PII/token/payload/url.
 * Example:
 *   svc=paris route=ingest ok=true inserted=false status=200 dur_ms=7
 */
export function log(fields: LogFields) {
  try {
    const base = { svc: 'paris', ...fields } as LogFields;
    // eslint-disable-next-line no-console
    console.log(fmt(base));
  } catch {
    // ignore logging errors
  }
}

/** Deployment marker (called at module load) */
export function markDeploy(component: string, extra?: LogFields) {
  log({ route: 'deploy', component, event: 'deploy_start', ...extra });
}


