(() => {
  const root = document.documentElement;
  const grid = document.querySelector('.studio-grid');
  const preview = document.getElementById('centerPreview');

  // Theme segmented
  document.querySelectorAll('.segmented[aria-label="Theme"] .segmented__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      document.querySelectorAll('.segmented[aria-label="Theme"] .segmented__btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      root.setAttribute('data-theme', theme);
      window.dispatchEvent(new CustomEvent('studio:theme', { detail: { theme } }));
    });
  });

  // Viewport segmented
  document.querySelectorAll('.segmented[aria-label="Viewport"] .segmented__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-viewport');
      document.querySelectorAll('.segmented[aria-label="Viewport"] .segmented__btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (mode === 'mobile') preview?.classList.add('is-mobile'); else preview?.classList.remove('is-mobile');
      window.dispatchEvent(new CustomEvent('studio:viewport', { detail: { mode } }));
    });
  });

  // Panel collapse via data attributes on grid
  document.querySelectorAll('[data-collapse]').forEach(btn => {
    btn.addEventListener('click', () => {
      const side = btn.getAttribute('data-collapse');
      if (!grid || (side !== 'left' && side !== 'right')) return;
      const key = side === 'left' ? 'left' : 'right';
      const current = grid.getAttribute(`data-${key}`) || 'open';
      const next = current === 'collapsed' ? 'open' : 'collapsed';
      grid.setAttribute(`data-${key}`, next);
      window.dispatchEvent(new CustomEvent('studio:panel', { detail: { side, state: next } }));
    });
  });

  // Copy stub
  document.getElementById('copyBtn')?.addEventListener('click', () => {
    console.log('copy triggered');
  });
})();


