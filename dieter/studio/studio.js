/* Studio shell behavior:
   - Theme buttons (Light/Dark/HC) toggle data-theme on the host document (and forward to iframe docElement if same-origin).
   - Desktop/Mobile toggle sets a fixed viewport width on the iframe for quick device preview.
   - Collapse buttons hide/show side panels.
   - Copy button copies the editor CSS content.
*/

(function () {
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  const root = document.documentElement;
  const frame = $('#studio-frame');
  const left  = $('#studio-left');
  const right = $('#studio-right');
  const leftToggle  = $('#studio-left-toggle');
  const rightToggle = $('#studio-right-toggle');

  const themeBtns = $$('.js-theme');
  const themeReset = $('#js-theme-reset');

  const viewDesktop = $('#js-view-desktop');
  const viewMobile  = $('#js-view-mobile');

  const cssEditor = $('#studio-css');
  const copyBtn   = $('#studio-copy');

  function setPressed(btns, current) {
    btns.forEach(b => b.setAttribute('aria-pressed', String(b === current)));
  }

  function applyTheme(mode) {
    // HC uses data-theme="hc", light/dark rely on the OS (no attribute) but we visually mark state.
    if (mode === 'hc') {
      root.setAttribute('data-theme', 'hc');
    } else {
      root.removeAttribute('data-theme');
    }
    // mirror to iframe if possible
    try {
      const doc = frame?.contentWindow?.document?.documentElement;
      if (doc) {
        if (mode === 'hc') doc.setAttribute('data-theme', 'hc');
        else doc.removeAttribute('data-theme');
      }
    } catch {}
  }

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      setPressed(themeBtns, btn);
    });
  });
  themeReset?.addEventListener('click', () => {
    root.removeAttribute('data-theme');
    try { frame.contentWindow?.document?.documentElement?.removeAttribute('data-theme'); } catch {}
    setPressed(themeBtns, null);
  });

  // Viewport toggle: constrain iframe to a typical mobile width, or full width for desktop.
  function setViewport(mode) {
    if (!frame) return;
    if (mode === 'mobile') {
      frame.style.maxWidth = '390px';  // iPhone-ish width
      frame.style.marginInline = 'auto';
    } else {
      frame.style.maxWidth = '';
      frame.style.marginInline = '';
    }
  }
  viewDesktop?.addEventListener('click', () => {
    setViewport('desktop');
    setPressed([viewDesktop, viewMobile], viewDesktop);
  });
  viewMobile?.addEventListener('click', () => {
    setViewport('mobile');
    setPressed([viewDesktop, viewMobile], viewMobile);
  });

  // Collapse/expand side panels
  leftToggle?.addEventListener('click', () => {
    left.classList.toggle('is-collapsed');
  });
  rightToggle?.addEventListener('click', () => {
    right.classList.toggle('is-collapsed');
  });

  // Live CSS injection into iframe
  let styleTag;
  function injectCSS(css) {
    try {
      const doc = frame?.contentWindow?.document;
      if (!doc) return;
      if (!styleTag) {
        styleTag = doc.createElement('style');
        styleTag.setAttribute('data-studio-injected', 'true');
        doc.head.appendChild(styleTag);
      }
      styleTag.textContent = css;
    } catch {}
  }
  cssEditor?.addEventListener('input', () => injectCSS(cssEditor.value));

  // Copy CSS
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(cssEditor.value || '');
      copyBtn.setAttribute('aria-label', 'Copied!');
      setTimeout(() => copyBtn.setAttribute('aria-label', 'Copy CSS'), 1000);
    } catch {}
  });

  // Initialize defaults
  setViewport('desktop');              // default desktop
  if (viewDesktop) setPressed([viewDesktop, viewMobile], viewDesktop);
})();


