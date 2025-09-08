(() => {
  const root = document.documentElement;
  const themeBtns = document.querySelectorAll('[data-theme-btn]');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      root.setAttribute('data-theme', btn.dataset.themeBtn);
    });
  });
})();


