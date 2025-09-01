import SnippetBox from './SnippetBox';
const PUBLIC_ID = process.env.DEMO_PUBLIC_ID || 'DEMO';
const EMBED_VERSION = Number(process.env.EMBED_VERSION || 1);
const isDev = process.env.NODE_ENV === 'development';

export const metadata = {
  title: 'Contact Form Widget – Clickeen',
  description: 'Contact form widget under 28KB, 100ms TTI, Shadow DOM isolation.',
};

export async function generateMetadata() {
  return { alternates: { languages: { en: '/widgets/contact-form', it: '/it/widgets/contact-form' } } };
}

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Contact Form widget</h1>
      <div id={`ckeen-${PUBLIC_ID}`}></div>
      <script
        async
        defer
        src={
          isDev
            ? `http://localhost:3002/api/e/${PUBLIC_ID}`
            : `https://cdn.c-keen.com/e/${PUBLIC_ID}.js?v=${EMBED_VERSION}`
        }
      />
      <h3>Copy-paste snippet</h3>
      <SnippetBox publicId={PUBLIC_ID} version={EMBED_VERSION} isDev={isDev} />
      {/* keep your JSON-LD injection below if present */}
    </main>
  );
}
