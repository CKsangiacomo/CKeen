(() => {
  const root = document.documentElement;
  const frame = document.getElementById('dp-frame');
  const ta = document.getElementById('dp-css');
  const copyBtn = document.getElementById('dp-copy');

  // Apply theme to both the host page and the iframe (demo.html uses data-theme="hc" opt-in).
  const setPressed = (btn) => document.querySelectorAll('.js-theme').forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
  let currentMode = null;
  const applyTheme = (mode) => {
    currentMode = mode;
    const docs = [document, frame.contentDocument].filter(Boolean);
    docs.forEach(d => {
      const el = d.documentElement;
      if (!el) return;
      if (mode === 'hc') el.setAttribute('data-theme', 'hc');
      else el.removeAttribute('data-theme'); // light/dark rely on prefers-color-scheme in CSS
    });
  };
  document.querySelectorAll('.js-theme').forEach(btn => {
    btn.addEventListener('click', () => { applyTheme(btn.dataset.theme); setPressed(btn); });
  });
  document.getElementById('js-theme-reset').addEventListener('click', () => { currentMode = null; applyTheme(null); setPressed(null); });
  frame.addEventListener('load', () => { if (currentMode) applyTheme(currentMode); inject(); });

  // Live CSS injection into the iframe
  let styleEl;
  const inject = () => {
    const doc = frame.contentDocument; if (!doc) return;
    if (!styleEl) {
      styleEl = doc.createElement('style');
      styleEl.setAttribute('data-dieter-preview', 'overrides');
      doc.head.appendChild(styleEl);
    }
    styleEl.textContent = ta.value || '';
  };
  ta.addEventListener('input', inject);

  // Copy CSS
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(ta.value || '');
      copyBtn.classList.add('ok');
      setTimeout(() => copyBtn.classList.remove('ok'), 800);
    } catch {}
  });

  // Component list → scroll matching section by heading text inside the iframe
  document.getElementById('dp-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.dp-list__item'); if (!btn) return;
    document.querySelectorAll('.dp-list__item').forEach(b => b.classList.toggle('is-active', b === btn));
    const doc = frame.contentDocument; if (!doc) return;
    const targetText = btn.dataset.section;
    const headings = Array.from(doc.querySelectorAll('h2, .text-18, .text-title-fluid'));
    const target = headings.find(h => (h.textContent || '').trim().includes(targetText));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

(() => {
const root = document.documentElement;
const frame = document.getElementById(‘dp-frame’);
const ta = document.getElementById(‘dp-css’);
const copyBtn = document.getElementById(‘dp-copy’);
// theme toggle
const setPressed = (btn) => document.querySelectorAll(’.js-theme’).forEach(b => b.setAttribute(‘aria-pressed’, b===btn ? ‘true’ : ‘false’));
const applyTheme = (mode) => {
if (mode === ‘hc’) { root.setAttribute(‘data-theme’,‘hc’); }
else { root.removeAttribute(‘data-theme’); }
};
document.querySelectorAll(’.js-theme’).forEach(btn => {
btn.addEventListener(‘click’, () => { applyTheme(btn.dataset.theme); setPressed(btn); });
});
document.getElementById(‘js-theme-reset’).addEventListener(‘click’, () => { root.removeAttribute(‘data-theme’); setPressed(null); });

// inject CSS into iframe on input
let styleEl;
const inject = () => {
const doc = frame.contentDocument;
if (!doc) return;
if (!styleEl) {
styleEl = doc.createElement(‘style’);
styleEl.setAttribute(‘data-dieter-preview’,‘overrides’);
doc.head.appendChild(styleEl);
}
styleEl.textContent = ta.value || ‘’;
};
frame.addEventListener(‘load’, inject);
ta.addEventListener(‘input’, inject);

// copy CSS
copyBtn.addEventListener(‘click’, async () => {
try { await navigator.clipboard.writeText(ta.value || ‘’); copyBtn.classList.add(‘ok’); setTimeout(()=>copyBtn.classList.remove(‘ok’), 800); }
catch { /* noop */ }
});

// component list → attempt to scroll matching section by heading text
const list = document.getElementById(‘dp-list’);
list.addEventListener(‘click’, (e) => {
const btn = e.target.closest(’.dp-list__item’); if (!btn) return;
document.querySelectorAll(’.dp-list__item’).forEach(b=>b.classList.toggle(‘is-active’, b===btn));
const doc = frame.contentDocument; if (!doc) return;
const sectionText = btn.dataset.section;
const headings = Array.from(doc.querySelectorAll(‘h2, .text-18, .text-title-fluid’));
const target = headings.find(h => (h.textContent || ‘’).trim().includes(sectionText));
if (target) target.scrollIntoView({behavior:‘smooth’, block:‘start’});
});
})();