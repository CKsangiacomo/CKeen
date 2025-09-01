import SnippetBox from '../../widgets/contact-form/SnippetBox';
const PUBLIC_ID = process.env.DEMO_PUBLIC_ID || 'DEMO';
const EMBED_VERSION = Number(process.env.EMBED_VERSION || 1);
const isDev = process.env.NODE_ENV === 'development';

export const metadata = {
  title: 'Widget modulo contatti – Clickeen',
  description: 'Widget modulo contatti sotto 28KB, 100ms TTI, isolamento Shadow DOM.',
};

export async function generateMetadata() {
  return { alternates: { languages: { en: '/widgets/contact-form', it: '/it/widgets/contact-form' } } };
}

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Widget modulo contatti</h1>
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
      <h3>Snippet copia-incolla</h3>
      <SnippetBox publicId={PUBLIC_ID} version={EMBED_VERSION} isDev={isDev} />
    </main>
  );
}
