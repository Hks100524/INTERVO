import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

import AppProviders from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'AI Interview Prep - Master Your Interview Skills',
  description:
    'Generate AI-powered interview questions and get instant feedback on your answers. Practice makes perfect!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-white">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
