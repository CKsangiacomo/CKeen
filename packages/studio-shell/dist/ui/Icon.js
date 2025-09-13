"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icon = Icon;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MAX_CACHE_SIZE = 120;
const TARGET_SIZE = 80;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map();
function prune() {
    if (cache.size <= MAX_CACHE_SIZE)
        return;
    const entries = Array.from(cache.entries()).sort((a, b) => a[1].ts - b[1].ts);
    const toRemove = Math.max(0, cache.size - TARGET_SIZE);
    for (const [key] of entries.slice(0, toRemove))
        cache.delete(key);
}
function toKebab(name) {
    return name.replace(/\./g, '-');
}
function pathFor(name) {
    return `/dieter/icons/svg/${toKebab(name)}.svg`;
}
async function fetchIcon(name) {
    const hit = cache.get(name);
    if (hit) {
        const isFresh = Date.now() - hit.ts < CACHE_TTL_MS;
        if (isFresh)
            return hit.svg;
        // stale -> treat as miss; update timestamp after re-fetch
        cache.delete(name);
    }
    try {
        const res = await fetch(pathFor(name));
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const svg = await res.text();
        cache.set(name, { svg, ts: Date.now() });
        prune();
        return svg;
    }
    catch (e) {
        console.warn(`[studio] Icon load failed: ${name}`, e);
        const fallback = '⚠️';
        cache.set(name, { svg: fallback, ts: Date.now() });
        prune();
        return fallback;
    }
}
function Icon({ name, size = 'md', ariaLabel, className, }) {
    const [svg, setSvg] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        setSvg(null);
        fetchIcon(name).then(result => {
            if (!cancelled)
                setSvg(result);
        });
        return () => { cancelled = true; };
    }, [name]);
    // Loading placeholder
    if (svg === null) {
        return (0, jsx_runtime_1.jsx)("span", { className: `studio-icon studio-icon--loading ${className !== null && className !== void 0 ? className : ''}`, "data-size": size, "aria-hidden": "true" });
    }
    // Missing fallback
    if (svg === '⚠️') {
        return (0, jsx_runtime_1.jsx)("span", { className: `studio-icon studio-icon--missing ${className !== null && className !== void 0 ? className : ''}`, "data-size": size, "aria-hidden": "true", children: "\u26A0\uFE0F" });
    }
    // Inline SVG (color via currentColor)
    return ((0, jsx_runtime_1.jsx)("span", { className: `studio-icon ${className !== null && className !== void 0 ? className : ''}`, "data-size": size, role: ariaLabel ? 'img' : undefined, "aria-label": ariaLabel, "aria-hidden": ariaLabel ? undefined : true, dangerouslySetInnerHTML: { __html: svg } }));
}
