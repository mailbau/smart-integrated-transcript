import './globals.css';
import React from 'react';

export const metadata = {
  title: 'SIT - Sistem Informasi Transkrip',
  description: 'Ajukan Transkrip'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans">
        <nav className="border-b">
          <div className="container-narrow flex items-center justify-between py-3 text-sm">
            <div className="font-semibold">SIT</div>
            <div className="flex gap-4">
              <a className="link" href="/request">Ajukan Transkrip</a>
              <a className="link" href="/status">Status Aplikasi</a>
              <a className="link" href="/login">Masuk</a>
            </div>
          </div>
        </nav>
        <main className="container-narrow py-8">{children}</main>
      </body>
    </html>
  );
}
