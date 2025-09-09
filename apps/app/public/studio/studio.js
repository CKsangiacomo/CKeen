(() => {
  const root = document.documentElement;
  const grid = document.querySelector('.studio-grid');
  const preview = document.getElementById('centerPreview');

  // Theme segmented (Light/Dark)
  const segTheme = document.getElementById('segTheme');
  segTheme?.querySelectorAll('button[role="tab"]').forEach(btn => {
    btn.addEventListener('click', () => {
      segTheme.querySelectorAll('button[role="tab"]').forEach(b => b.setAttribute('aria-selected','false'));
      btn.setAttribute('aria-selected','true');
      const theme = btn.getAttribute('data-theme') || 'light';
      root.setAttribute('data-theme', theme);
      window.dispatchEvent(new CustomEvent('studio:theme', { detail: { theme } }));
    });
  });

  // Viewport segmented (Desktop/Mobile)
  const segViewport = document.getElementById('segViewport');
  segViewport?.querySelectorAll('button[role="tab"]').forEach(btn => {
    btn.addEventListener('click', () => {
      segViewport.querySelectorAll('button[role="tab"]').forEach(b => b.setAttribute('aria-selected','false'));
      btn.setAttribute('aria-selected','true');
      const mode = btn.getAttribute('data-viewport') || 'desktop';
      if (mode === 'mobile') preview?.classList.add('is-mobile'); else preview?.classList.remove('is-mobile');
      window.dispatchEvent(new CustomEvent('studio:viewport', { detail: { mode } }));
    });
  });

  // Panel collapse (data attributes drive layout)
  document.querySelectorAll('[data-collapse]').forEach(btn => {
    btn.addEventListener('click', () => {
      const side = btn.getAttribute('data-collapse');
      if (!side || !grid) return;
      const key = side === 'left' ? 'left' : 'right';
      const isClosed = (grid.getAttribute(`data-${key}`) === 'closed');
      grid.setAttribute(`data-${key}`, isClosed ? 'open' : 'closed');
      window.dispatchEvent(new CustomEvent('studio:panel', { detail: { side: key, collapsed: !isClosed } }));
    });
  });

  // Copy button stub
  document.getElementById('copyBtn')?.addEventListener('click', () => {
    console.log('copy triggered');
  });
})();
