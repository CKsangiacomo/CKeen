export const dynamic = "force-static";

export default function StudioPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex,nofollow" />
        <title>Dieter — Components</title>
        <link rel="stylesheet" href="/studio/studio.css" />
      </head>
      <body>
        <header className="studio-topbar">
          <div className="studio-topbar__title">Dieter — Components</div>
          <div className="studio-topbar__actions">
            <button className="studio-btn js-theme" data-theme="light" aria-pressed="false">Light</button>
            <button className="studio-btn js-theme" data-theme="dark" aria-pressed="false">Dark</button>
            <button className="studio-btn js-theme" data-theme="hc" aria-pressed="false">HC</button>
            <button id="js-theme-reset" className="studio-btn" aria-pressed="false">Reset</button>
          </div>
        </header>

        <main className="studio-layout" role="main">
          {/* Left panel */}
          <aside id="studio-left" className="studio-panel" aria-label="Components">
            <div className="studio-panel__header">
              <span>Components</span>
              <button id="studio-left-toggle" className="studio-btn" style={{ marginLeft: "auto" }}>Collapse</button>
            </div>
            <div className="studio-panel__body">
              <div id="studio-list" className="studio-list" />
            </div>
          </aside>

          {/* Center canvas */}
          <section className="studio-panel studio-canvas" aria-label="Preview">
            <div className="studio-panel__header">
              <span>Preview</span>
              <div className="studio-canvas__toolbar" style={{ marginLeft: "auto" }}>
                <button id="js-view-desktop" className="studio-btn" aria-pressed="true">Desktop</button>
                <button id="js-view-mobile" className="studio-btn" aria-pressed="false">Mobile</button>
              </div>
            </div>
            <div className="studio-panel__body">
              <iframe
                id="studio-frame"
                className="studio-frame"
                src="/dieter/components.html"
                sandbox="allow-same-origin allow-scripts"
                title="Dieter Components"
              />
            </div>
          </section>

          {/* Right editor */}
          <aside id="studio-right" className="studio-panel" aria-label="CSS Editor">
            <div className="studio-panel__header">
              <span>CSS Editor</span>
              <button id="studio-copy" className="studio-iconbtn" aria-label="Copy CSS" title="Copy CSS">⧉</button>
              <button id="studio-right-toggle" className="studio-btn" style={{ marginLeft: 8 }}>Collapse</button>
            </div>
            <div className="studio-panel__body">
              <textarea id="studio-css" className="studio-editor" placeholder="/* Type CSS to inject into the preview iframe */" />
              <div className="studio-help">Host shell uses system-ui; Dieter styles live in the iframe.</div>
            </div>
          </aside>
        </main>

        <script src="/studio/studio.js" />
      </body>
    </html>
  );
}


