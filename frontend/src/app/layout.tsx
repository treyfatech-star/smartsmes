import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <aside className="w-60 bg-slate-900 text-white p-5 space-y-3">
            <h1 className="font-bold text-xl">SmartSMEs</h1>
            {['dashboard', 'invoices', 'expenses', 'customers', 'vendors', 'settings'].map((s) => (
              <Link key={s} href={`/${s}`} className="block capitalize text-slate-200 hover:text-white">{s}</Link>
            ))}
          </aside>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
