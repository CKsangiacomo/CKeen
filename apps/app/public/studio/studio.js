(() => {
  const root = document.documentElement;

  // Theme segmented control
  document.querySelectorAll('.segmented[aria-label="Theme"] .segmented__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      document.querySelectorAll('.segmented[aria-label="Theme"] .segmented__btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      root.setAttribute('data-theme', theme);
      window.dispatchEvent(new CustomEvent('studio:theme', { detail: { theme } }));
    });
  });

  // Viewport segmented control
  const preview = document.getElementById('centerPreview');
  document.querySelectorAll('.segmented[aria-label="Viewport"] .segmented__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-viewport');
      document.querySelectorAll('.segmented[aria-label="Viewport"] .segmented__btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (mode === 'mobile') preview?.classList.add('is-mobile');
      else preview?.classList.remove('is-mobile');
      window.dispatchEvent(new CustomEvent('studio:viewport', { detail: { mode } }));
    });
  });

  // Panel collapse
  const leftPanel = document.querySelector('.panel--left');
  const rightPanel = document.querySelector('.panel--right');
  document.querySelectorAll('[data-collapse]').forEach(btn => {
    btn.addEventListener('click', () => {
      const side = btn.getAttribute('data-collapse');
      const el = side === 'left' ? leftPanel : rightPanel;
      if (!el) return;
      const collapsed = !el.classList.toggle('is-collapsed'); // toggle returns boolean for new state
      // For flat layout, simply hide the panel when collapsed
      if (el.classList.contains('is-collapsed')) el.style.display = 'none'; else el.style.display = '';
      window.dispatchEvent(new CustomEvent('studio:panel', { detail: { side, collapsed } }));
    });
  });

  // Copy button stub
  const copyBtn = document.getElementById('copyBtn');
  copyBtn?.addEventListener('click', () => {
    console.log('copy triggered');
  });
})();


