/* Neutral Studio host JS — no Dieter coupling */
(function(){
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  const frame = $('#studio-frame');
  const listHost = $('#studio-list');
  const left = $('#studio-left');
  const right = $('#studio-right');
  const leftToggle = $('#studio-left-toggle');
  const rightToggle = $('#studio-right-toggle');
  const themeBtns = $$('.js-theme');
  const themeReset = $('#js-theme-reset');
  const viewDesktop = $('#js-view-desktop');
  const viewMobile = $('#js-view-mobile');
  const cssEditor = $('#studio-css');
  const copyBtn = $('#studio-copy');

  function setPressed(btns, current){ btns.forEach(b=>b.setAttribute('aria-pressed', String(b===current))); }

  function applyThemeToIframe(mode){
    try{
      const docEl = frame?.contentWindow?.document?.documentElement;
      if(!docEl) return;
      if(mode==='hc'){ docEl.setAttribute('data-theme','hc'); }
      else { docEl.removeAttribute('data-theme'); }
    }catch{}
  }

  themeBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{ applyThemeToIframe(btn.dataset.theme); setPressed(themeBtns, btn); });
  });
  themeReset?.addEventListener('click', ()=>{ try{ frame.contentWindow?.document?.documentElement?.removeAttribute('data-theme'); }catch{} setPressed(themeBtns, null); });

  function setViewport(mode){
    if(!frame) return;
    if(mode==='mobile'){ frame.style.maxWidth='393px'; frame.style.marginInline='auto'; }
    else { frame.style.maxWidth=''; frame.style.marginInline=''; }
  }
  viewDesktop?.addEventListener('click', ()=>{ setViewport('desktop'); setPressed([viewDesktop, viewMobile], viewDesktop); });
  viewMobile?.addEventListener('click', ()=>{ setViewport('mobile'); setPressed([viewDesktop, viewMobile], viewMobile); });

  leftToggle?.addEventListener('click', ()=>{ left?.classList.toggle('is-collapsed'); });
  rightToggle?.addEventListener('click', ()=>{ right?.classList.toggle('is-collapsed'); });

  // Live CSS inject into iframe
  let styleTag;
  function injectCSS(css){
    try{
      const doc = frame?.contentWindow?.document; if(!doc) return;
      if(!styleTag){ styleTag = doc.createElement('style'); styleTag.setAttribute('data-studio-injected','true'); doc.head.appendChild(styleTag); }
      styleTag.textContent = css;
    }catch{}
  }
  cssEditor?.addEventListener('input', ()=> injectCSS(cssEditor.value));
  copyBtn?.addEventListener('click', async ()=>{ try{ await navigator.clipboard.writeText(cssEditor.value||''); copyBtn.setAttribute('aria-label','Copied!'); setTimeout(()=>copyBtn.setAttribute('aria-label','Copy CSS'), 800); }catch{} });

  // Build sidebar from iframe
  function kebabCase(str){
    return String(str||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }

  function ensureSectionId(doc, el, fallback, index){
    if (el.id) return el.id;
    const base = kebabCase(fallback||`section-${index+1}`) || `section-${index+1}`;
    let id = base, n = 1;
    while (doc.getElementById(id)) { id = `${base}-${n++}`; }
    el.id = id;
    return id;
  }

  function ensureFocusable(el){
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex','-1');
  }

  function injectActiveObserver(doc){
    try{
      const script = doc.createElement('script');
      script.type = 'text/javascript';
      script.textContent = `(()=>{
        const sections = Array.from(document.querySelectorAll('[data-component]'));
        const send = (id)=>{ try{ parent.postMessage({ type:'studio:active', id }, '*'); }catch(e){} };
        const obs = new IntersectionObserver((entries)=>{
          let best = null; let max = 0;
          for (const e of entries){ if(e.isIntersecting && e.intersectionRatio>max){ max=e.intersectionRatio; best=e; } }
          if(best){ const id = best.target.id; if(id) send(id); }
        }, { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0.1,0.25,0.5,0.75,1]});
        sections.forEach(s=>obs.observe(s));
        window.addEventListener('hashchange', ()=>{ send(location.hash.slice(1)); });
      })();`;
      doc.head.appendChild(script);
    }catch{}
  }

  function rebuildSidebar(){
    try{
      const doc = frame.contentWindow?.document; if(!doc || !listHost) return;
      const components = Array.from(doc.querySelectorAll('[data-component]'));
      listHost.innerHTML='';
      const items = [];
      components.forEach((el, i)=>{
        const labelFromHeading = el.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim();
        const fallback = el.getAttribute('data-component')||`Section ${i+1}`;
        const targetId = ensureSectionId(doc, el, fallback, i);
        ensureFocusable(el);
        const label = labelFromHeading || fallback;
        const btn = document.createElement('button');
        btn.className='studio-list__item';
        btn.type='button';
        btn.textContent=label;
        btn.setAttribute('aria-controls', targetId);
        btn.dataset.targetId = targetId;
        btn.addEventListener('click', (ev)=>{
          ev.preventDefault();
          try{
            const target = doc.getElementById(targetId);
            if (target) {
              target.scrollIntoView({behavior:'smooth', block:'start'});
              target.focus({ preventScroll: true });
            }
          }catch{}
        });
        listHost.appendChild(btn);
        items.push(btn);
      });
      // active state message listener
      window.addEventListener('message', (e)=>{
        const data = e?.data;
        if (!data || data.type !== 'studio:active') return;
        const id = data.id;
        Array.from(listHost.querySelectorAll('.studio-list__item')).forEach(b=>{
          const isActive = b.dataset.targetId === id;
          b.classList.toggle('is-active', isActive);
          if (isActive) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
        });
      }, { once: false });

      injectActiveObserver(doc);
    }catch{}
  }

  frame?.addEventListener('load', rebuildSidebar);

  // Defaults
  setViewport('desktop'); setPressed([viewDesktop, viewMobile], viewDesktop);
})();


