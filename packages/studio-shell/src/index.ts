import React from 'react';

// Minimal StudioRoot component
const StudioRoot: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return React.createElement('div', { id: 'studio-root', className: 'studio-shell' }, children);
};

// Minimal event bus stub (no-ops for V0)
export const studioBus = {
  emit: (_evt?: unknown) => {},
  on: (_listener?: unknown) => () => {}
};

// API stubs for V0
export function setTheme(_theme: 'light' | 'dark') {}
export function setViewport(_vp: 'desktop' | 'mobile') {}

// Exports
export const StudioShell = StudioRoot;
export default StudioRoot;
