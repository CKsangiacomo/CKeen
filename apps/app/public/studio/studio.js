/* Studio Host Shell behaviors only (no Dieter logic here). */

// Theme toggles
(function () {
  const setTheme = (t) => document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.getAttribute('data-theme-btn')));
  });
})();

// Preview size toggles (desktop/mobile)
(function () {
  const frame = document.getElementById('previewFrame');
  const wrap  = document.getElementById('previewWrap');
  document.querySelectorAll('[data-preview-size]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-preview-size');
      frame.classList.toggle('preview__frame--mobile', mode === 'mobile');
    });
  });
})();

// CSS injection into iframe (safe for same-origin Dieter preview)
(function () {
  const ta = document.getElementById('cssEditor');
  const frame = document.getElementById('previewFrame');
  let styleTag = null;

  function applyCSS() {
    try {
      const doc = frame.contentDocument;
      if (!doc) return;
      if (!styleTag) {
        styleTag = doc.getElementById('studio-injected-css');
        if (!styleTag) {
          styleTag = doc.createElement('style');
          styleTag.id = 'studio-injected-css';
          doc.head.appendChild(styleTag);
        }
      }
      styleTag.textContent = ta.value || '';
    } catch (e) {
      // Cross-origin or timing — fail silently in host shell
      // (Dieter remains functional even if injection is unavailable)
    }
  }

  // Apply on input and once when iframe loads
  ta.addEventListener('input', applyCSS);
  document.getElementById('cssCollapseBtn').addEventListener('click', () => {
    const wrap = document.getElementById('cssEditorWrap');
    const open = wrap.style.display !== 'none';
    wrap.style.display = open ? 'none' : 'block';
    document.getElementById('cssCollapseBtn').setAttribute('aria-expanded', String(!open));
  });
  document.getElementById('previewFrame').addEventListener('load', applyCSS);
})();


