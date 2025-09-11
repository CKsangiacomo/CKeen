import React, { useEffect, useState } from 'react';

type IconSize = 'sm' | 'md' | 'lg';
type CacheEntry = { svg: string; ts: number };

const MAX_CACHE_SIZE = 100;
const TARGET_SIZE = 80;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

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
  if (hit) {
    const isFresh = Date.now() - hit.ts < CACHE_TTL_MS;
    if (isFresh) return hit.svg;
    cache.delete(name);
  }
  try {
    const res = await fetch(pathFor(name));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const svg = await res.text();
    cache.set(name, { svg, ts: Date.now() });
    prune();
    return svg;
  } catch (e) {
    console.warn(`[studio] Icon load failed: ${name}`, e);
    const fallback = '⚠️';
    cache.set(name, { svg: fallback, ts: Date.now() });
    prune();
    return fallback;
  }
}

export function Icon({
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
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    fetchIcon(name).then(result => {
      if (!cancelled) setSvg(result);
    });
    return () => { cancelled = true; };
  }, [name]);

  // Loading placeholder
  if (svg === null) {
    return <span className={`studio-icon studio-icon--loading ${className ?? ''}`} data-size={size} aria-hidden="true" />;
  }

  // Missing fallback
  if (svg === '⚠️') {
    return <span className={`studio-icon studio-icon--missing ${className ?? ''}`} data-size={size} aria-hidden="true">⚠️</span>;
  }

  // Inline SVG (color via currentColor)
  return (
    <span
      className={`studio-icon ${className ?? ''}`}
      data-size={size}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}


