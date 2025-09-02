const PUBLIC_ID = process.env.DEMO_PUBLIC_ID || 'DEMO';
const EMBED_VERSION = Number(process.env.EMBED_VERSION || 1);
const isDev = process.env.NODE_ENV === 'development';
const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata() {
  const url = `${BASE}/widgets/contact-form`;
  return {
    title: 'Contact Form Widget – Fast, Lightweight, Accessible | Clickeen',
    description: 'Contact form widget under 28KB, 100ms TTI, Shadow DOM isolation. Copy-paste snippet for any site.',
    alternates: {
      canonical: url,
      languages: {
        en: url,
        it: `${BASE}/it/widgets/contact-form`,
      },
    },
    openGraph: {
      title: 'Contact Form Widget – Clickeen',
      description: 'Under 28KB, 100ms TTI, Shadow DOM isolation.',
      url,
      siteName: 'Clickeen',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Contact Form Widget – Clickeen',
      description: 'Under 28KB, 100ms TTI, Shadow DOM isolation.',
    },
  };
}

export default function Page() {
  const siteUrl = BASE;
  const softwareLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Clickeen Contact Form Widget',
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    isAccessibleForFree: true,
    url: `${siteUrl}/widgets/contact-form`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Does it work on WordPress/Wix/Squarespace?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, paste the snippet into any HTML block.' } },
      { '@type': 'Question', name: 'How do submissions reach me?', acceptedAnswer: { '@type': 'Answer', text: 'They are stored in your dashboard; email/webhooks later.' } },
      { '@type': 'Question', name: 'Is there a badge?', acceptedAnswer: { '@type': 'Answer', text: 'Free tier shows a small badge; Pro removes it.' } }
    ]
  };

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

      <h3 style={{ marginTop: 24 }}>Copy-paste snippet</h3>
      <pre style={{ background:'#f6f6f6', padding:12, borderRadius:8, overflow:'auto' }}>{`<div id="ckeen-${PUBLIC_ID}"></div>
<script async defer src="${isDev ? `http://localhost:3002/api/e/${PUBLIC_ID}` : `https://cdn.c-keen.com/e/${PUBLIC_ID}.js?v=${EMBED_VERSION}`}"></script>`}</pre>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </main>
  );
}
