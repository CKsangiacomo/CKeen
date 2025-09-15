/* Clickeen Embed Runtime (P1) */
var m={light:{bg:"#ffffff",fg:"#111111",border:"#e5e7eb",accent:"#111111",radius:8,gap:8,pad:16},dark:{bg:"#111111",fg:"#f5f5f5",border:"#374151",accent:"#f5f5f5",radius:8,gap:8,pad:16}};function c(s="light"){return m[s]??m.light}function b(s,u){try{s.innerHTML=""}catch{}let p=document.createElement("div");p.setAttribute("data-ckeen","contact-form"),s.appendChild(p);let l=u.cfg||{},a=l.theme||"light",t=c(a),r=document.createElement("form");r.style.all="revert",r.style.boxSizing="border-box",r.style.maxWidth="420px",r.style.borderRadius=`${t.radius}px`,r.style.padding=`${t.pad}px`;let d=document.createElement("div");d.style.fontWeight="600",d.style.marginBottom="12px";let i=document.createElement("div");i.style.display="flex",i.style.flexDirection="column",i.style.gap=`${t.gap}px`;let o=document.createElement("input");o.name="message",o.placeholder="Your message";let n=document.createElement("button");n.type="submit",n.textContent=l.submitText??"Send",n.style.padding="10px 12px",n.style.borderRadius="6px",n.style.fontWeight="600";function g(e){a=e==="dark"?"dark":"light",t=c(a),r.style.background=t.bg,r.style.color=t.fg,r.style.border=`1px solid ${t.border}`,i.style.gap=`${t.gap}px`,o.style.all="revert",o.style.padding="10px",o.style.border=`1px solid ${t.border}`,o.style.borderRadius="6px",o.style.color=t.fg,o.style.background=t.bg,n.style.border=`1px solid ${t.accent}`,n.style.background=t.accent,n.style.color=t.bg}function y(e){!e||typeof e!="object"||(typeof e.title=="string"&&(d.textContent=e.title),typeof e.placeholder=="string"&&(o.placeholder=e.placeholder))}return r.appendChild(d),i.appendChild(o),r.appendChild(i),r.appendChild(n),p.appendChild(r),d.textContent=l.props?.title||l.title||"Contact us",o.placeholder=l.props?.placeholder||"Your message",g(a),y(l.props),r.addEventListener("submit",e=>{e.preventDefault()}),{update(e){if(!e||typeof e!="object")return;let f=a;l={...l,...e},e.theme&&e.theme!==f&&g(String(e.theme)),e.props&&typeof e.props=="object"&&y(e.props),typeof e.submitText=="string"&&(n.textContent=e.submitText)},destroy(){try{s.innerHTML=""}catch{}}}}export{b as renderContactForm};


const API = {
  render: async (host, ctx) => {
    const handle = await renderContactForm(host, ctx);
    try {
      const apiBase = (ctx && typeof ctx.apiBase === 'string' && ctx.apiBase) || (typeof location !== 'undefined' ? location.origin : '');
      const env = {
        workspace_id: ctx?.cfg?.workspace_id,
        widget_id: ctx?.cfg?.widget_id,
        cfg_version: ctx?.cfg?.publishHash,
        embed_version: 'p1'
      };
      // Dynamically import telemetry without creating a static dependency for size analysis
      (0, eval)('import("/embed-runtime/telemetry.js")')
        .then(m => m && m.emitWidgetEvent && m.emitWidgetEvent(apiBase, env, 'widget_loaded', { render_ms: 0 }))
        .catch(() => {});
    } catch {}
    return handle;
  }
};
export default API.render;
export const render = API.render;
export const boot = API.render;
if (typeof window !== 'undefined') {
  window.CKeen = window.CKeen || {};
  window.CKeen.render = API.render;
}
