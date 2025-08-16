import './globals.css';
import React from 'react';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata = {
  title: 'SIT - Sistem Informasi Transkrip',
  description: 'Ajukan Transkrip'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-gray-50 min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
