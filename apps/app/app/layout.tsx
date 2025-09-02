import Link from 'next/link';

export const metadata = { title: 'Clickeen Dashboard' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto', color: '#111' }}>
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid #eee' }}>
          <nav style={{ display:'flex', gap:16 }}>
            <Link href="/">Dashboard</Link>
            <Link href="/workspaces">My Workspaces</Link>
          </nav>
          <form action="/api/auth/signout" method="post">
            <button type="submit" style={{ padding:'6px 10px', border:'1px solid #ddd', borderRadius:'8px', background:'#fff' }}>Sign out</button>
          </form>
        </header>
        {children}
      </body>
    </html>
  );
}
