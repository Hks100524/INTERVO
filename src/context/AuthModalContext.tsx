'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type AuthModalMode =
  | 'signin'
  | 'signup';

interface AuthModalContextValue {
  modalOpen: boolean;
  modalMode: AuthModalMode;
  openSignin: () => void;
  openSignup: () => void;
  closeModal: () => void;
}

const AuthModalContext =
  createContext<
    AuthModalContextValue | undefined
  >(undefined);

export function AuthModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [modalOpen, setModalOpen] =
    useState(false);
  const [modalMode, setModalMode] =
    useState<AuthModalMode>('signin');

  const openSignin =
    useCallback(() => {
      setModalMode('signin');
      setModalOpen(true);
    }, []);

  const openSignup =
    useCallback(() => {
      setModalMode('signup');
      setModalOpen(true);
    }, []);

  const closeModal =
    useCallback(() => {
      setModalOpen(false);
    }, []);

  return (
    <AuthModalContext.Provider
      value={{
        modalOpen,
        modalMode,
        openSignin,
        openSignup,
        closeModal,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context =
    useContext(AuthModalContext);

  if (!context) {
    throw new Error(
      'useAuthModal must be used within an AuthModalProvider'
    );
  }

  return context;
}
