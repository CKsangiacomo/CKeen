import { mountShadow, beacon } from '@ck/embed-core';
export function renderContactForm(host, cfg={}){
  const L = { name:'Name', email:'Email', message:'Message', submit:'Send', success:'Thanks! We received your message.' };
  const css = `:host{all:initial}*{font-family:ui-sans-serif,system-ui,-apple-system;box-sizing:border-box}.ck{display:grid;gap:10px;padding:16px;border-radius:10px;border:1px solid #ddd}input,textarea{padding:10px 12px;border:1px solid #ccc;border-radius:8px}button{padding:10px 14px;border-radius:8px;border:0;background:#2F80ED;color:#fff;cursor:pointer}`;
  const html = `<form class="ck" aria-label="Contact form"><label>${L.name}<input name="name" required/></label><label>${L.email}<input type="email" name="email" required/></label><label>${L.message}<textarea name="message" rows="4" required></textarea></label><button type="submit">${L.submit}</button><p id="ck-success" style="display:none">${L.success}</p></form>`;
  const root = mountShadow(host, html, css);
  const form = root.querySelector('form');
  form?.addEventListener('submit', async (e)=>{e.preventDefault(); const data=Object.fromEntries(new FormData(form).entries());
    await fetch('/api/form/DEMO_PUBLIC_ID', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(data) });
    root.getElementById('ck-success').style.display='block';
    beacon('submit', { ok:true });
  });
  beacon('impression', {});
}
