export const runtime = 'edge';
export async function GET(_: Request, { params }: { params: { publicId: string }}) {
  const js = `
(()=>{var id='ckeen-${params.publicId}';var host=document.getElementById(id)||document.querySelector('[data-ckeen="${params.publicId}"]');if(!host){host=document.createElement('div');host.id=id;document.currentScript?.parentElement?.appendChild(host);}var s=document.createElement('script');s.type='module';s.textContent=\`
  import { renderContactForm } from '/embed-bundle.js';
  renderContactForm(host, {});
\`;document.currentScript?.after(s);})();`;
  return new Response(js, { headers: {
    'content-type':'application/javascript; charset=utf-8',
    'cache-control':'public, max-age=31536000, immutable'
  }});
}
