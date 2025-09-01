export const metadata = { title: 'Clickeen Dashboard' };
export default function RootLayout({ children }: any) {
  return <html lang="en"><body><nav style={{padding:12,borderBottom:'1px solid #eee'}}>Widgets | Settings</nav>{children}</body></html>;
}
