(() => {
  const root = document.documentElement;
  const frame = document.getElementById('previewFrame');
  const blank = document.getElementById('blankNotice');
  const cssTA = document.getElementById('cssEditor');
  const cssWrap = document.getElementById('cssEditorWrap');
  const cssCollapseBtn = document.getElementById('cssCollapseBtn');

  // Theme controls — LIGHT default (already set in <html data-theme="light">)
  const themeBtns = document.querySelectorAll('[data-theme-btn]');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      root.setAttribute('data-theme', btn.dataset.themeBtn);
    });
  });

  // Desktop / Mobile viewport
  const sizeBtns = document.querySelectorAll('[data-preview-size]');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      if (btn.dataset.previewSize === 'mobile') {
        frame.classList.add('preview__frame--mobile');
      } else {
        frame.classList.remove('preview__frame--mobile');
      }
    });
  });

  // Load preview URL (query param or input)
  const urlInput = document.getElementById('previewUrl');
  const loadBtn = document.getElementById('loadBtn');

  function loadPreview(url) {
    if (!url) return;
    frame.src = url;
    if (blank) blank.style.display = 'none';
  }

  // If ?preview= is present, override default src
  const qp = new URLSearchParams(location.search);
  const previewParam = qp.get('preview');
  if (previewParam) {
    if (urlInput) urlInput.value = previewParam;
    loadPreview(previewParam);
  }

  if (loadBtn) loadBtn.addEventListener('click', () => loadPreview(urlInput.value.trim()));

  // Inject CSS into iframe (host-only experiment)
  function injectCss(css) {
    try {
      const doc = frame.contentDocument;
      if (!doc) return;
      let style = doc.getElementById('__studio_injected_css__');
      if (!style) {
        style = doc.createElement('style');
        style.id = '__studio_injected_css__';
        doc.head.appendChild(style);
      }
      style.textContent = css || '';
    } catch { /* ignore cross-origin errors */ }
  }
  if (cssTA) cssTA.addEventListener('input', (e) => injectCss(e.target.value));

  // Collapse editor
  if (cssCollapseBtn) {
    cssCollapseBtn.addEventListener('click', () => {
      const open = cssCollapseBtn.getAttribute('aria-expanded') !== 'false';
      cssWrap.style.display = open ? 'none' : 'block';
      cssCollapseBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  }
})();


