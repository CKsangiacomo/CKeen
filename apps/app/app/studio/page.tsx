'use client';

import React from 'react';
import { StudioShell } from '@ck/studio-shell';

function Outline() {
  return (
    <ul style={{ padding: 12, fontSize: 12 }}>
      <li>Widget A</li>
      <li>Widget B</li>
      <li>Widget C</li>
    </ul>
  );
}

function Properties() {
  return (
    <div style={{ padding: 12, fontSize: 12 }}>
      <div><strong>Inspector</strong></div>
      <div>Selected: none</div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <StudioShell>
      <StudioShell.Left>
        <Outline />
      </StudioShell.Left>

      <StudioShell.Canvas>
        <div style={{ padding: 24 }}>
          <h2 style={{ marginBottom: 12 }}>Canvas demo</h2>
          <p>Toggle Theme / Viewport in the right rail. Mobile viewport constrains the <code>.stage</code> width.</p>
          <div style={{ height: 600, background: 'var(--color-surface, #f8f8f8)', border: '1px dashed #ddd', display: 'grid', placeItems: 'center' }}>
            <span style={{ opacity: 0.7 }}>Your widget/content renders here.</span>
          </div>
        </div>
      </StudioShell.Canvas>

      <StudioShell.Inspector>
        <Properties />
      </StudioShell.Inspector>
    </StudioShell>
  );
}
