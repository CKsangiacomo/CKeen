(function () {
  const host = document.documentElement;
  const frame = document.getElementById('dieter-frame');
  const input = document.getElementById('css-input');
  const clear = document.getElementById('css-clear');

  // Theme switching for host shell only (light/dark/hc)
  document.querySelectorAll('.tbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tbtn').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      host.setAttribute('data-theme', btn.dataset.theme || 'light');
    });
  });

  // Live-inject CSS into the iframe head for quick visual experiments
  let styleEl;
  function injectCSS(css) {
    try {
      const doc = frame?.contentWindow?.document;
      if (!doc) return;
      if (!styleEl) {
        styleEl = doc.createElement('style');
        styleEl.setAttribute('data-injected', 'studio');
        doc.head.appendChild(styleEl);
      }
      styleEl.textContent = String(css || '');
    } catch { /* sandbox guards still allow same-origin; fail silently otherwise */ }
  }

  input?.addEventListener('input', () => injectCSS(input.value));
  clear?.addEventListener('click', () => { input.value = ''; injectCSS(''); });

  // Initialize once iframe is ready
  frame?.addEventListener('load', () => injectCSS(input.value));
})();


