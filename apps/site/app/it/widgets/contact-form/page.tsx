'use client';

import { useState } from 'react';

// Client component for the snippet box
function SnippetBox({ publicId, version, isDev }: { publicId: string; version: number; isDev: boolean }) {
  const [copied, setCopied] = useState(false);
  
  const scriptSrc = isDev 
    ? `http://localhost:3002/api/e/${publicId}`
    : `https://cdn.c-keen.com/e/${publicId}.js?v=${version}`;
  
  const snippet = `<div id="ckeen-${publicId}"></div>
<script async defer src="${scriptSrc}"></script>`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ margin: '24px 0' }}>
      <textarea
        value={snippet}
        readOnly
        style={{
          width: '100%',
          minHeight: '80px',
          fontFamily: 'monospace',
          fontSize: '14px',
          padding: '12px',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          resize: 'vertical'
        }}
      />
      <button
        onClick={copyToClipboard}
        style={{
          marginTop: '8px',
          padding: '8px 16px',
          backgroundColor: copied ? '#28a745' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        {copied ? 'Copiato!' : 'Copia'}
      </button>
    </div>
  );
}

const PUBLIC_ID = process.env.DEMO_PUBLIC_ID || 'DEMO';
const EMBED_VERSION = process.env.EMBED_VERSION || 1;
const isDev = process.env.NODE_ENV === 'development';

export const metadata = { 
  title: 'Widget modulo contatti – Clickeen',
  alternates: { 
    languages: { 
      en: '/widgets/contact-form', 
      it: '/it/widgets/contact-form' 
    } 
  }
};

export default function Page() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: '#1a1a1a' }}>
          Widget modulo contatti, istantaneo.
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
          Meno di 28 KB. 100 ms all'interazione. Nessun iframe fino al clic.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="#demo" 
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            Prova dal vivo
          </a>
          <button 
            onClick={() => document.getElementById('snippet')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#007bff',
              border: '1px solid #007bff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Copia snippet
          </button>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>Demo dal vivo</h2>
        <div 
          id={`ckeen-${PUBLIC_ID}`}
          style={{ 
            border: '1px solid #e1e5e9', 
            borderRadius: '8px', 
            padding: '24px',
            backgroundColor: '#f8f9fa'
          }}
        ></div>
        <script 
          async 
          defer 
          src={isDev 
            ? `http://localhost:3002/api/e/${PUBLIC_ID}`
            : `https://cdn.c-keen.com/e/${PUBLIC_ID}.js?v=${EMBED_VERSION}`
          }
        />
      </section>

      {/* Why It's Faster */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>Perché è più veloce</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#007bff', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '1.1rem' }}>Payload limitato a 28 KB</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#007bff', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '1.1rem' }}>Distribuito via Edge e cache immutabile</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#007bff', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '1.1rem' }}>Nessun iframe pesante al caricamento</span>
          </div>
        </div>
      </section>

      {/* Copy-paste Snippet */}
      <section id="snippet" style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>Snippet copia-incolla</h2>
        <SnippetBox publicId={PUBLIC_ID} version={EMBED_VERSION} isDev={isDev} />
      </section>

      {/* Customization */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>Personalizzazione</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#666' }}>
          Il widget si adatta automaticamente al tema del tuo sito. Personalizza colori, font e comportamento tramite la nostra dashboard o API.
        </p>
      </section>

      {/* Accessibility & Privacy */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>Accessibilità e Privacy</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Accessibilità</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Navigazione da tastiera, ARIA, rispetto 'riduci animazioni'.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Privacy</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Nessun tracker nello script; analytics anonimi e opzionali.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>FAQ</h2>
        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Quanto è veloce?</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Il widget si carica in meno di 100ms ed è memorizzato nella cache globalmente tramite CDN.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1a1a1a' }}>È conforme al GDPR?</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Sì, raccogliamo solo i dati che esplicitamente permetti e forniamo esportazione/eliminazione completa dei dati.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Posso personalizzare lo stile?</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Assolutamente. Usa proprietà CSS personalizzate o la nostra dashboard per abbinare il tuo brand.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', color: '#1a1a1a' }}>Pronto a iniziare?</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '24px' }}>
          Unisciti a migliaia di sviluppatori che usano i widget Clickeen.
        </p>
        <a 
          href="/dashboard" 
          style={{
            padding: '16px 32px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1.1rem'
          }}
        >
          Inizia Gratis
        </a>
      </section>
    </main>
  );
}
