import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const entry = resolve(__dirname, '../../..', 'packages/widgets/src/index.ts');
const out = resolve(__dirname, '..', 'public', 'embed-bundle.js');

await build({
  entryPoints: [entry],
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  outfile: out,
  treeShaking: true,
  metafile: true,
});

// Provide a stable surface for the loader: render/boot/default, plus window fallback
const prelude = `/* Clickeen Embed Runtime (P1) */\n`;
const apiShim = `
const API = {
  render: async (host, ctx) => {
    const handle = await renderContactForm(host, ctx);
    try {
      const apiBase = (ctx && typeof ctx.apiBase === 'string' && ctx.apiBase) || (typeof location !== 'undefined' ? location.origin : '');
      const env = {
        workspace_id: ctx?.cfg?.workspace_id,
        widget_id: ctx?.cfg?.widget_id,
        cfg_version: ctx?.cfg?.publishHash,
        embed_version: 'p1'
      };
      // Dynamically import telemetry without creating a static dependency for size analysis
      (0, eval)('import("/embed-runtime/telemetry.js")')
        .then(m => m && m.emitWidgetEvent && m.emitWidgetEvent(apiBase, env, 'widget_loaded', { render_ms: 0 }))
        .catch(() => {});
    } catch {}
    return handle;
  }
};
export default API.render;
export const render = API.render;
export const boot = API.render;
if (typeof window !== 'undefined') {
  window.CKeen = window.CKeen || {};
  window.CKeen.render = API.render;
}
`;

const orig = readFileSync(out, 'utf8');
writeFileSync(out, prelude + orig + '\n' + apiShim, 'utf8');

console.log('[build-embed] wrote', out);


