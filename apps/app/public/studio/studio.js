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
  frame?.addEventListener('load', ()=>{
    try{
      const doc = frame.contentWindow?.document; if(!doc || !listHost) return;
      const components = Array.from(doc.querySelectorAll('[data-component]'));
      listHost.innerHTML='';
      function setActive(btn){ Array.from(listHost.querySelectorAll('.studio-list__item')).forEach(b=>b.classList.remove('is-active')); btn?.classList.add('is-active'); }
      components.forEach((el, i)=>{
        const name = el.getAttribute('data-component')||`Section ${i+1}`;
        const btn = document.createElement('button');
        btn.className='studio-list__item'; btn.type='button'; btn.textContent=name;
        btn.addEventListener('click', ()=>{ try{ el.scrollIntoView({behavior:'smooth', block:'start'}); }catch{} setActive(btn); });
        listHost.appendChild(btn);
        if(i===0) setActive(btn);
      });
    }catch{}
  });

  // Defaults
  setViewport('desktop'); setPressed([viewDesktop, viewMobile], viewDesktop);
})();


