'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';

import { useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/lib/auth';

function UserIcon() {
  return (
    <svg
      className="h-6 w-6"
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
  src,
  name,
}: {
  src?: string;
  name: string;
}) {
  if (src) {
    return (
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

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();

  const displayName =
    user
      ? [user.firstName, user.lastName]
          .filter(Boolean)
          .join(' ') || user.username || 'User'
      : 'User';

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

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        {(() => {
          const avatarImage =
            user.image ||
            (user as AuthUser & {
              profileImage?: string;
            }).profileImage;

          // local UI state
          const [editingUsername, setEditingUsername] = useState(false);
          const [newUsername, setNewUsername] = useState(user.username || '');
          const [usernameLoading, setUsernameLoading] = useState(false);
          const [usernameError, setUsernameError] = useState<string | null>(null);
          const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);

          const [currentPassword, setCurrentPassword] = useState('');
          const [newPassword, setNewPassword] = useState('');
          const [confirmPassword, setConfirmPassword] = useState('');
          const [pwdLoading, setPwdLoading] = useState(false);
          const [pwdError, setPwdError] = useState<string | null>(null);
          const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

          // image upload state
          const fileInputRef = useRef<HTMLInputElement | null>(null);
          const [selectedFile, setSelectedFile] = useState<File | null>(null);
          const [previewUrl, setPreviewUrl] = useState<string | null>(null);
          const [uploadLoading, setUploadLoading] = useState(false);
          const [uploadError, setUploadError] = useState<string | null>(null);
          const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

          return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative">
                  <div
                    className="h-20 w-20 overflow-hidden rounded-full border border-white/10 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    aria-label="Change profile image"
                  >
                    <Avatar src={previewUrl || avatarImage} name={displayName} />
                  </div>

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

                      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                      if (!allowed.includes(file.type)) {
                        setUploadError('Unsupported file type');
                        return;
                      }

                      const MAX = 5 * 1024 * 1024;
                      if (file.size > MAX) {
                        setUploadError('File too large (max 5MB)');
                        return;
                      }

                      setSelectedFile(file);

                      const reader = new FileReader();
                      reader.onload = () => {
                        setPreviewUrl(typeof reader.result === 'string' ? reader.result : null);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />

                  {previewUrl && (
                    <div className="absolute -right-2 -bottom-2 flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <button
                          className="rounded-full bg-[#6c47ff] px-3 py-1 text-xs font-medium text-white"
                          onClick={async () => {
                            if (!previewUrl) return;
                            setUploadLoading(true);
                            setUploadError(null);
                            setUploadSuccess(null);

                            try {
                              const res = await fetch('/api/auth/upload-profile-image', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ image: previewUrl }),
                              });

                              const data = await res.json().catch(() => null);

                              if (!res.ok || !data?.success) {
                                setUploadError(data?.message || 'Upload failed');
                              } else {
                                setUploadSuccess('Uploaded');
                                setSelectedFile(null);
                                setPreviewUrl(null);
                                await refreshUser();
                              }
                            } catch (err) {
                              setUploadError('Upload failed');
                            } finally {
                              setUploadLoading(false);
                            }
                          }}
                          disabled={uploadLoading}
                        >
                          Upload
                        </button>

                        <button
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            setUploadError(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>

                      {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
                      {uploadSuccess && <p className="text-xs text-green-400">{uploadSuccess}</p>}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-2xl font-semibold">
                    {displayName}
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Username</p>

                  {!editingUsername ? (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{user.username}</p>
                      <button
                        className="ml-4 rounded-full border border-white/10 px-3 py-1 text-sm text-gray-200 hover:bg-white/5"
                        onClick={() => {
                          setUsernameError(null);
                          setUsernameSuccess(null);
                          setNewUsername(user.username || '');
                          setEditingUsername(true);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2">
                      <input
                        className="rounded-md bg-white/5 px-3 py-2 text-white placeholder:text-gray-400"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        aria-label="new-username"
                      />
                      <div className="flex gap-2">
                        <button
                          className="rounded-full bg-[#6c47ff] px-4 py-1 text-sm font-medium text-white"
                          onClick={async () => {
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
                                setUsernameError(data?.message || 'Failed to update username');
                              } else {
                                setUsernameSuccess('Username updated');
                                setEditingUsername(false);
                                // refresh auth user
                                await refreshUser();
                              }
                            } catch (err) {
                              setUsernameError('Failed to update username');
                            } finally {
                              setUsernameLoading(false);
                            }
                          }}
                          disabled={usernameLoading}
                        >
                          Save
                        </button>

                        <button
                          className="rounded-full border border-white/10 px-4 py-1 text-sm text-gray-200"
                          onClick={() => {
                            setEditingUsername(false);
                            setUsernameError(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>

                      {usernameError && <p className="text-sm text-red-400">{usernameError}</p>}
                      {usernameSuccess && <p className="text-sm text-green-400">{usernameSuccess}</p>}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Email</p>
                  <p className="mt-2 text-sm font-medium text-white">{user.email}</p>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Change Password</p>
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    className="rounded-md bg-white/5 px-3 py-2 text-white placeholder:text-gray-400"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />

                  <input
                    type="password"
                    placeholder="New password"
                    className="rounded-md bg-white/5 px-3 py-2 text-white placeholder:text-gray-400"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="rounded-md bg-white/5 px-3 py-2 text-white placeholder:text-gray-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <div className="flex gap-2">
                    <button
                      className="rounded-full bg-[#6c47ff] px-4 py-1 text-sm font-medium text-white"
                      onClick={async () => {
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
                        } catch (err) {
                          setPwdError('Failed to change password');
                        } finally {
                          setPwdLoading(false);
                        }
                      }}
                      disabled={pwdLoading}
                    >
                      Change Password
                    </button>

                    <button
                      className="rounded-full border border-white/10 px-4 py-1 text-sm text-gray-200"
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

                  {pwdError && <p className="text-sm text-red-400">{pwdError}</p>}
                  {pwdSuccess && <p className="text-sm text-green-400">{pwdSuccess}</p>}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
