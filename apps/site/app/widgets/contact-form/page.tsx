const PUBLIC_ID = process.env.DEMO_PUBLIC_ID || 'DEMO';
export const metadata = { title: 'Contact Form Widget – Clickeen' };
export default function Page(){
  return (<main style={{padding:24}}>
    <h1>Contact Form widget</h1>
    <div id={`ckeen-${PUBLIC_ID}`}></div>
    <script async defer src={`https://cdn.c-keen.com/e/${PUBLIC_ID}.js?v=${process.env.EMBED_VERSION||1}`}></script>
    <h3>Copy-paste snippet</h3>
    <pre>{`<div id="ckeen-${PUBLIC_ID}"></div>
<script async defer src="https://cdn.c-keen.com/e/${PUBLIC_ID}.js?v=1"></script>`}</pre>
  </main>);
}
