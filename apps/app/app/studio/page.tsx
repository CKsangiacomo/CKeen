"use client"
 
import Script from 'next/script'

export default function StudioPage() {
  return (
    <main style={{height:'100dvh'}}>
      <link rel="stylesheet" href="/studio/tokens.css" />
      <link rel="stylesheet" href="/studio/studio.css" />
      <div className="studio-grid">
        <div className="studio-topbar">
          <strong>Studio</strong>
        </div>
        <div id="slot-templateRow" className="studio-template-row"></div>
        <div id="slot-left" className="panel panel-left"></div>
        <div id="slot-center" className="panel panel-center">
          <div id="centerCanvas" className="studio-theme-light studio-viewport-desktop">
            <div style={{padding:24}}>
              <h2>Center Canvas</h2>
              <p>Demo Content</p>
            </div>
          </div>
        </div>
        <div id="slot-right" className="panel panel-right"></div>
      </div>
      <Script src="/studio/studio.js" strategy="afterInteractive" onLoad={() => { (window as any).Studio?.ready?.(); }} />
    </main>
  )
}
