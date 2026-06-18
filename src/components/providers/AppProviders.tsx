'use client';

import { AuthProvider } from '@/context/AuthContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
import AuthModal from '@/components/AuthModal';
import Navbar from '@/components/Navbar';
import type { ReactNode } from 'react';

export default function AppProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <Navbar />
        <AuthModal />
        {children}
      </AuthModalProvider>
    </AuthProvider>
  );
}
