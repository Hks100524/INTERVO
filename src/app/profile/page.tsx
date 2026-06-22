'use client';

import Link from 'next/link';
import {
  useRef,
  useState,
} from 'react';

import { useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/lib/auth';

function UserIcon({
  className = 'h-6 w-6',
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

function PencilIcon({
  className = 'h-4 w-4',
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
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="m16.5 3.5 4 4L8 20l-4.5 1 1-4.5L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({
  className = 'h-4 w-4',
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
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect
        x="4"
        y="11"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function MailIcon({
  className = 'h-4 w-4',
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
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m4.5 7.5 7.5 6 7.5-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Avatar({
  src,
  name,
}: {
  src?: string;
  name: string;
}) {
  if (src) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt={`${name} avatar`}
        className="h-full w-full rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-white/5 text-white/90">
      <UserIcon />
    </div>
  );
}

const inputClassName =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-400 focus:border-[#6c47ff]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#6c47ff]/20';

const primaryButtonClassName =
  'inline-flex items-center justify-center rounded-full bg-[#6c47ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5a38e0] focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/25 disabled:cursor-not-allowed disabled:opacity-60';

const secondaryButtonClassName =
  'inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60';

const cardClassName =
  'rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md';

const innerCardClassName =
  'rounded-2xl border border-white/10 bg-black/20 shadow-[0_16px_40px_rgba(0,0,0,0.22)]';

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();

  const [editingUsername, setEditingUsername] =
    useState(false);
  const [newUsername, setNewUsername] =
    useState('');
  const [usernameLoading, setUsernameLoading] =
    useState(false);
  const [usernameError, setUsernameError] =
    useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] =
    useState<string | null>(null);

  const [currentPassword, setCurrentPassword] =
    useState('');
  const [newPassword, setNewPassword] =
    useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [pwdLoading, setPwdLoading] =
    useState(false);
  const [pwdError, setPwdError] =
    useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] =
    useState<string | null>(null);
  const [passwordExpanded, setPasswordExpanded] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);
  const [uploadLoading, setUploadLoading] =
    useState(false);
  const [uploadError, setUploadError] =
    useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] =
    useState<string | null>(null);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-gray-300">
            Loading profile...
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
            <p className="text-lg font-semibold">
              Profile
            </p>
            <p className="mt-2 text-sm text-gray-300">
              You are not signed in.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-full bg-[#6c47ff] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#5a38e0]"
            >
              Go home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const avatarImage =
    user.image ||
    (user as AuthUser & {
      profileImage?: string;
    }).profileImage;

  const displayName =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ') || user.username || 'User';

  const openPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handleUploadPreview = async () => {
    if (!previewUrl) return;

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await fetch(
        '/api/auth/upload-profile-image',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ image: previewUrl }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setUploadError(data?.message || 'Upload failed');
      } else {
        setUploadSuccess('Uploaded');
        setPreviewUrl(null);
        await refreshUser();
      }
    } catch {
      setUploadError('Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUsernameSave = async () => {
    setUsernameLoading(true);
    setUsernameError(null);
    setUsernameSuccess(null);

    try {
      const res = await fetch('/api/auth/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: newUsername }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setUsernameError(
          data?.message || 'Failed to update username'
        );
      } else {
        setUsernameSuccess('Username updated');
        setEditingUsername(false);
        await refreshUser();
      }
    } catch {
      setUsernameError('Failed to update username');
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwdLoading(true);
    setPwdError(null);
    setPwdSuccess(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setPwdError(data?.message || 'Failed to change password');
      } else {
        setPwdSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPwdError('Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <div className={`${cardClassName} p-5 sm:p-6`}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <button
                type="button"
                onClick={openPhotoPicker}
                aria-label="Change profile photo"
                title="Change profile photo"
                className="group h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-slate-900/90 shadow-inner transition hover:border-[#6c47ff]/40 hover:shadow-[0_0_0_1px_rgba(108,71,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/25 sm:h-28 sm:w-28"
              >
                <Avatar
                  src={previewUrl || avatarImage}
                  name={displayName}
                />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  setUploadError(null);
                  setUploadSuccess(null);

                  const file = e.target.files?.[0] ?? null;
                  if (!file) return;

                  const allowed = [
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/webp',
                  ];
                  if (!allowed.includes(file.type)) {
                    setUploadError('Unsupported file type');
                    return;
                  }

                  const MAX = 5 * 1024 * 1024;
                  if (file.size > MAX) {
                    setUploadError('File too large (max 5MB)');
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = () => {
                    setPreviewUrl(
                      typeof reader.result === 'string'
                        ? reader.result
                        : null
                    );
                  };
                  reader.readAsDataURL(file);
                }}
              />

              <button
                type="button"
                onClick={openPhotoPicker}
                className={primaryButtonClassName}
              >
                Change Photo
              </button>

              {previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleUploadPreview}
                      disabled={uploadLoading}
                      className={primaryButtonClassName}
                    >
                      Upload
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null);
                        setUploadError(null);
                      }}
                      className={secondaryButtonClassName}
                    >
                      Cancel
                    </button>
                  </div>

                  {uploadError && (
                    <p className="text-xs text-red-400">
                      {uploadError}
                    </p>
                  )}
                  {uploadSuccess && (
                    <p className="text-xs text-green-400">
                      {uploadSuccess}
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="min-w-0 flex-1 pt-1 sm:pt-2">
              <p className="truncate text-2xl font-semibold">
                {displayName}
              </p>
              <p className="mt-1 break-words text-sm text-gray-300">
                {user.email}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className={`${innerCardClassName} p-4 sm:p-5`}>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300">
                  <UserIcon className="h-4 w-4" />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">
                  Username
                </p>
              </div>

              {!editingUsername ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-base font-semibold text-white sm:text-lg">
                    {user.username}
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm font-medium text-gray-200 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/10"
                    onClick={() => {
                      setUsernameError(null);
                      setUsernameSuccess(null);
                      setNewUsername(user.username || '');
                      setEditingUsername(true);
                    }}
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <input
                    className={inputClassName}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    aria-label="new-username"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={primaryButtonClassName}
                      onClick={handleUsernameSave}
                      disabled={usernameLoading}
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      className={secondaryButtonClassName}
                      onClick={() => {
                        setEditingUsername(false);
                        setUsernameError(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  {usernameError && (
                    <p className="text-sm text-red-400">
                      {usernameError}
                    </p>
                  )}
                  {usernameSuccess && (
                    <p className="text-sm text-green-400">
                      {usernameSuccess}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className={`${innerCardClassName} p-4 sm:p-5`}>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300">
                  <MailIcon className="h-4 w-4" />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">
                  Email
                </p>
              </div>

              <p className="mt-3 break-words text-sm font-medium text-white sm:text-base">
                {user.email}
              </p>
            </div>
          </div>

          <div className={`${innerCardClassName} mt-4 p-4 sm:p-5`}>
            {!passwordExpanded ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300">
                    <LockIcon className="h-4 w-4" />
                  </span>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">
                      Change Password
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Click &quot;Update&quot; to change your password
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={primaryButtonClassName}
                  onClick={() => setPasswordExpanded(true)}
                >
                  Update
                </button>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300">
                      <LockIcon className="h-4 w-4" />
                    </span>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">
                        Change Password
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        Enter your current and new password below
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={secondaryButtonClassName}
                    onClick={() => setPasswordExpanded(false)}
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-gray-300">
                      Current Password
                    </span>
                    <input
                      type="password"
                      placeholder="Current password"
                      className={inputClassName}
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(e.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-gray-300">
                      New Password
                    </span>
                    <input
                      type="password"
                      placeholder="New password"
                      className={inputClassName}
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-gray-300">
                      Confirm Password
                    </span>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className={inputClassName}
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                    />
                  </label>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      className={primaryButtonClassName}
                      onClick={handlePasswordChange}
                      disabled={pwdLoading}
                    >
                      Change Password
                    </button>

                    <button
                      type="button"
                      className={secondaryButtonClassName}
                      onClick={() => {
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPwdError(null);
                        setPwdSuccess(null);
                      }}
                    >
                      Reset
                    </button>
                  </div>

                  {pwdError && (
                    <p className="text-sm text-red-400">
                      {pwdError}
                    </p>
                  )}
                  {pwdSuccess && (
                    <p className="text-sm text-green-400">
                      {pwdSuccess}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
