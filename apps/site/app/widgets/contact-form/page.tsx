'use client';

import { useState } from 'react';

// Client component for the snippet box
function SnippetBox({ publicId, version, isDev }: { publicId: string; version: number; isDev: boolean }) {
  const [copied, setCopied] = useState(false);
  
  const scriptSrc = isDev 
    ? `http://localhost:3002/api/e/${publicId}`
    : `https://c-keen-embed.vercel.app/api/e/${publicId}?v=${version}`;
  
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
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

const PUBLIC_ID = process.env.DEMO_PUBLIC_ID || 'DEMO';
const EMBED_VERSION = Number(process.env.EMBED_VERSION) || 1;
const isDev = process.env.NODE_ENV === 'development';

export default function Page() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: '#1a1a1a' }}>
          Contact Form Widget, Instant.
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
          Under 28 KB. 100ms to interaction. No iframe until click.
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
            Try Live Demo
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
            Copy Snippet
          </button>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>Live Demo</h2>
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
            : `https://c-keen-embed.vercel.app/api/e/${PUBLIC_ID}?v=${EMBED_VERSION}`
          }
        />
      </section>

      {/* Why It's Faster */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>Why It's Faster</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#007bff', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '1.1rem' }}>Payload limited to 28 KB</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#007bff', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '1.1rem' }}>Distributed via Edge and immutable cache</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#007bff', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '1.1rem' }}>No heavy iframe on load</span>
          </div>
        </div>
      </section>

      {/* Copy-paste Snippet */}
      <section id="snippet" style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>Copy-paste Snippet</h2>
        <SnippetBox publicId={PUBLIC_ID} version={EMBED_VERSION} isDev={isDev} />
      </section>

      {/* Customization */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>Customization</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#666' }}>
          The widget automatically adapts to your site's theme. Customize colors, fonts, and behavior through our dashboard or API.
        </p>
      </section>

      {/* Accessibility & Privacy */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>Accessibility & Privacy</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Accessibility</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Keyboard navigation, ARIA labels, respects 'reduce motion' preferences.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Privacy</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              No trackers in the script; anonymous analytics optional.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>FAQ</h2>
        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1a1a1a' }}>How fast is it?</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              The widget loads in under 100ms and is cached globally via CDN.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Is it GDPR compliant?</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Yes, we only collect data you explicitly allow and provide full data export/deletion.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Can I customize the styling?</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Absolutely. Use CSS custom properties or our dashboard to match your brand.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', color: '#1a1a1a' }}>Ready to get started?</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '24px' }}>
          Join thousands of developers using Clickeen widgets.
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
          Get Started Free
        </a>
      </section>
    </main>
  );
}
