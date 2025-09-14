export const metadata = { title: 'Studio — Clickeen' };

// Layout-level import for StudioShell global CSS
import '@ck/studio-shell/src/styles/studio.css';

export default function StudioRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
