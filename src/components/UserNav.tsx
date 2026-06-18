'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import type { AuthUser } from '@/lib/auth';

function UserIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function Avatar({
  user,
  className = '',
}: {
  user: AuthUser;
  className?: string;
}) {
  const extendedUser =
    user as AuthUser & {
      profileImage?: string;
    };
  const avatarImage =
    extendedUser.profileImage ||
    user.image;

  if (avatarImage) {
    return (
      <img
        src={avatarImage}
        alt={`${user.firstName} ${user.lastName} avatar`}
        className={`h-full w-full rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full bg-white/5 text-white/90 ${className}`}
    >
      <UserIcon className="h-5 w-5" />
    </div>
  );
}

export default function UserNav() {
  const { user, loading, logout } = useAuth();
  const { openSignin, openSignup } =
    useAuthModal();
  const router = useRouter();
  const avatarButtonRef =
    useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] =
    useState(false);
  const [renderMenu, setRenderMenu] =
    useState(false);

  useEffect(() => {
    if (menuOpen) {
      setRenderMenu(true);
      return;
    }

    const timeout = window.setTimeout(() => {
      setRenderMenu(false);
    }, 160);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!user) {
      setMenuOpen(false);
    }
  }, [user]);

  const closeMenu = () => {
    setMenuOpen(false);
    avatarButtonRef.current?.focus();
  };

  const handleLogout = async () => {
    const didLogout = await logout();

    if (!didLogout) {
      return;
    }

    closeMenu();
    router.replace('/');
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={openSignin}
          className="h-8 rounded-full border border-gray-600 px-3 text-xs font-medium text-gray-300 transition hover:text-white sm:h-10 sm:px-4 sm:text-sm"
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={openSignup}
          className="h-8 rounded-full bg-[#6c47ff] px-3 text-xs font-medium text-white transition hover:bg-[#5a38e0] sm:h-10 sm:px-4 sm:text-sm"
        >
          Sign Up
        </button>
      </div>
    );
  }

  const displayName =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ') || user.username || 'User';

  return (
    <div className="relative">
      <button
        ref={avatarButtonRef}
        type="button"
        onClick={() =>
          setMenuOpen((current) => !current)
        }
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            closeMenu();
          }
        }}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls="user-profile-menu"
        aria-label={`Open account menu for ${displayName}`}
        className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/90 text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-white/20 ${
          menuOpen
            ? 'ring-2 ring-white/20'
            : 'hover:border-white/20 hover:bg-slate-800/90'
        }`}
      >
        <Avatar user={user} className="h-full w-full" />
      </button>

      {renderMenu ? (
        <>
          <div
            className={`fixed inset-0 z-[60] bg-transparent transition-opacity duration-150 ${
              menuOpen
                ? 'opacity-100'
                : 'pointer-events-none opacity-0'
            }`}
            onClick={closeMenu}
            aria-hidden="true"
          />

          <div
            id="user-profile-menu"
            role="menu"
            aria-label="User profile menu"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                closeMenu();
              }
            }}
            className={`absolute right-0 top-[calc(100%+0.75rem)] z-[70] w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-gray-800/80 bg-slate-950/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-150 ${
              menuOpen
                ? 'translate-y-0 scale-100 opacity-100'
                : 'pointer-events-none translate-y-1 scale-95 opacity-0'
            }`}
          >
            <div className="border-b border-white/10 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-white/5">
                  <Avatar user={user} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {displayName}
                  </p>

                  <p className="truncate text-xs text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <Link
                href="/profile"
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-200 transition hover:bg-white/5 hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-300">
                  <UserIcon className="h-4 w-4" />
                </span>
                <span>View Profile</span>
              </Link>

              <Link
                href="/dashboard"
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-200 transition hover:bg-white/5 hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-300">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5V21H5a1 1 0 0 1-1-1v-9.5Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>Dashboard</span>
              </Link>

              <div className="my-2 h-px bg-white/10" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-300">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M14 7l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 12H10"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
