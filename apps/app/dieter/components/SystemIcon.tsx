import * as React from 'react';

type IconSize = 'sm' | 'md' | 'lg';
type CacheEntry = { svg: string; ts: number };

const MAX_CACHE_SIZE = 100;
const TARGET_SIZE = 80;
const cache = new Map<string, CacheEntry>();

function prune() {
  if (cache.size < MAX_CACHE_SIZE) return;
  const entries = Array.from(cache.entries()).sort((a, b) => a[1].ts - b[1].ts);
  const toRemove = cache.size - TARGET_SIZE;
  for (const [key] of entries.slice(0, toRemove)) cache.delete(key);
}

function toKebab(name: string) {
  return name.replace(/\./g, '-');
}
function pathFor(name: string) {
  return `/dieter/icons/svg/${toKebab(name)}.svg`;
}

async function fetchIcon(name: string): Promise<string> {
  const hit = cache.get(name);
  if (hit) return hit.svg;
  try {
    const res = await fetch(pathFor(name));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const svg = await res.text();
    cache.set(name, { svg, ts: Date.now() });
    prune();
    return svg;
  } catch (e) {
    console.warn(`[app] Icon load failed: ${name}`, e);
    const fallback = '⚠️';
    cache.set(name, { svg: fallback, ts: Date.now() });
    prune();
    return fallback;
  }
}

export function SystemIcon({
  name,
  size = 'md',
  ariaLabel,
  className,
}: {
  name: string;
  size?: IconSize;
  ariaLabel?: string;
  className?: string;
}) {
  const [svg, setSvg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setSvg(null);
    fetchIcon(name).then(s => { if (!cancelled) setSvg(s); });
    return () => { cancelled = true; };
  }, [name]);

  const cls = `studio-icon ${className ?? ''}`;
  const dataSize = { 'data-size': size } as const;

  if (svg === null) {
    return <span className={`${cls} studio-icon--loading`} {...dataSize} aria-hidden="true" />;
  }
  if (svg === '⚠️') {
    return <span className={`${cls} studio-icon--missing`} {...dataSize} aria-hidden="true">⚠️</span>;
  }
  return (
    <span
      className={cls}
      {...dataSize}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}


