const PUBLIC_ID = process.env.DEMO_PUBLIC_ID || 'DEMO';
const EMBED_VERSION = Number(process.env.EMBED_VERSION || 1);
const isDev = process.env.NODE_ENV === 'development';
const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata() {
  const url = `${BASE}/it/widgets/contact-form`;
  return {
    title: 'Widget Modulo Contatti – Veloce, Leggero, Accessibile | Clickeen',
    description: "Meno di 28 KB. 100 ms all'interazione. Shadow DOM. Incolla lo snippet e vai.",
    alternates: {
      canonical: url,
      languages: {
        en: `${BASE}/widgets/contact-form`,
        it: url,
      },
    },
    openGraph: {
      title: 'Widget Modulo Contatti – Clickeen',
      description: "Meno di 28 KB. 100 ms all'interazione. Shadow DOM.",
      url,
      siteName: 'Clickeen',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Widget Modulo Contatti – Clickeen',
      description: "Meno di 28 KB. 100 ms all'interazione. Shadow DOM.",
    },
  };
}

export default function Page() {
  const siteUrl = BASE;
  const softwareLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Clickeen – Widget Modulo Contatti',
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    isAccessibleForFree: true,
    url: `${siteUrl}/it/widgets/contact-form`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Funziona su WordPress/Wix/Squarespace?', acceptedAnswer: { '@type': 'Answer', text: 'Sì, incolla lo snippet in un blocco HTML.' } },
      { '@type': 'Question', name: 'Come ricevo le submissions?', acceptedAnswer: { '@type': 'Answer', text: 'Sono nel tuo dashboard; email/webhook in seguito.' } },
      { '@type': 'Question', name: "C'è un badge?", acceptedAnswer: { '@type': 'Answer', text: 'Il piano Free mostra un piccolo badge; Pro lo rimuove.' } }
    ]
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Widget modulo contatti, istantaneo.</h1>
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

      <h3 style={{ marginTop: 24 }}>Snippet</h3>
      <pre style={{ background:'#f6f6f6', padding:12, borderRadius:8, overflow:'auto' }}>{`<div id="ckeen-${PUBLIC_ID}"></div>
<script async defer src="${isDev ? `http://localhost:3002/api/e/${PUBLIC_ID}` : `https://cdn.c-keen.com/e/${PUBLIC_ID}.js?v=${EMBED_VERSION}`}"></script>`}</pre>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </main>
  );
}
