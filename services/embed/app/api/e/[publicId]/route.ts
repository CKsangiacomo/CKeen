import type { NextRequest } from 'next/server';

export const runtime = 'edge';

function js(publicId: string) {
  return `(()=>{try{
    var s=document.currentScript;
    var src=new URL(s&&s.src?s.src:location.href,location.href);
    var qs=src.searchParams;
    var publicId=${JSON.stringify(publicId)};
    var token=qs.get('token')||(s&&s.dataset?s.dataset.ckeenToken:null);
    if(!token){
      if(/localhost|127\\.0\\.0\\.1/.test(location.host)){
        console.error('Clickeen: missing token');
        var d=document.createElement('div');
        d.style.cssText='all:revert;position:relative;padding:8px 10px;margin:8px 0;border:1px solid #f00;color:#f00;background:#fff';
        d.textContent='Clickeen: missing token';
        s&&s.parentNode&&s.parentNode.insertBefore(d,s.nextSibling);
      }
      return;
    }
    var apiBase=(s&&s.dataset&&s.dataset.ckeenApi)?s.dataset.ckeenApi:(src.origin);
    var cfgUrl=apiBase.replace(/\\/$/,'') + '/api/cfg/' + encodeURIComponent(publicId) + '?token=' + encodeURIComponent(token);
    var bundle=(s&&s.dataset&&s.dataset.ckeenBundle)?s.dataset.ckeenBundle:new URL('/embed-bundle.js', src).toString();

    var mount=document.createElement('div'); mount.className='ckeen-mount';
    if(s&&s.parentNode){ s.parentNode.insertBefore(mount,s.nextSibling); } else { document.body.appendChild(mount); }

    fetch(cfgUrl,{credentials:'omit'}).then(function(r){
      if(!r.ok) throw new Error('cfg_'+r.status);
      return r.json();
    }).then(function(cfg){
      return import(bundle).then(function(m){
        var fn = (m&& (m.render||m.boot||m.default)) || (window.CKeen && (window.CKeen.render||window.CKeen.boot));
        if(typeof fn!=='function') throw new Error('bundle_missing_render');
        fn(mount,{ publicId:publicId, token:token, cfg:cfg });
      });
    }).catch(function(err){
      if(/localhost|127\\.0\\.0\\.1/.test(location.host)){
        console.error('Clickeen loader error', err);
        var d=document.createElement('div');
        d.style.cssText='all:revert;position:relative;padding:8px 10px;margin:8px 0;border:1px solid #f00;color:#f00;background:#fff';
        d.textContent='Clickeen loader error: '+(err&&err.message?err.message:String(err));
        s&&s.parentNode&&s.parentNode.insertBefore(d,s.nextSibling);
      }
    });
  }catch(e){try{console.error(e);}catch(_){}})();`;
}

export async function GET(_req: NextRequest, ctx: { params: { publicId: string } }) {
  const { publicId } = ctx.params;
  const body = js(publicId);
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'public, max-age=300'
    }
  });
}
