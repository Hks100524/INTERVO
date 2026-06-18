'use client';

import type { ReactNode } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';

import SigninForm from '@/components/auth/Signinpage';
import SignupForm from '@/components/auth/Signuppage';

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/80 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[500px] overflow-hidden rounded-[20px] border border-zinc-200 bg-white text-slate-900 shadow-[0_32px_100px_rgba(0,0,0,0.38)]"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center text-zinc-400 transition hover:text-zinc-700"
          aria-label="Close auth modal"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="max-h-[calc(100vh-2rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AuthModal() {
  const {
    modalOpen,
    modalMode,
    closeModal,
    openSignin,
    openSignup,
  } = useAuthModal();
  const { refreshUser } = useAuth();

  const handleSuccess = async () => {
    await refreshUser();
    closeModal();
  };

  if (!modalOpen) {
    return null;
  }

  return (
    <ModalShell
      title={
        modalMode === 'signin'
          ? 'Sign in'
          : 'Sign up'
      }
      onClose={closeModal}
    >
      {modalMode === 'signin' ? (
        <SigninForm
          onSuccess={handleSuccess}
          onSwitchToSignup={openSignup}
        />
      ) : (
        <SignupForm
          onSuccess={handleSuccess}
          onSwitchToSignin={openSignin}
        />
      )}
    </ModalShell>
  );
}
