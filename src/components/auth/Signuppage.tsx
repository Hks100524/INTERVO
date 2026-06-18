'use client';

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

interface SignupFormProps {
  onSuccess: () => Promise<void> | void;
  onSwitchToSignin: () => void;
}

function GoogleButton() {
  return (
    <button
      type="button"
      aria-label="Continue with Google"
      className="flex h-11 w-full items-center justify-center gap-3 rounded-[10px] border border-zinc-200 bg-white text-[15px] font-medium text-zinc-600 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:bg-zinc-50 sm:h-12"
    >
      <svg
        className="h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 2.8-4.2 2.8-7.2 0-.7-.1-1.3-.2-1.9H12z"
        />
        <path
          fill="#34A853"
          d="M6.6 14.1l-.8.6-2.4 1.8C5 19.5 8.2 21 12 21c2.6 0 4.8-.9 6.4-2.4l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.7-1.7-5.4-3.9z"
        />
        <path
          fill="#4A90E2"
          d="M3.4 8.1A9 9 0 0 0 3 12c0 .6.1 1.2.2 1.8l3.4-2.7A5.4 5.4 0 0 1 12 6.6c1.5 0 2.9.5 4 1.5l3-3A9.9 9.9 0 0 0 12 3a10 10 0 0 0-8.6 5.1z"
        />
        <path
          fill="#FBBC05"
          d="M3.4 8.1 6.8 10.7A5.4 5.4 0 0 1 12 6.6c1.5 0 2.9.5 4 1.5l3-3A10 10 0 0 0 12 3a10 10 0 0 0-8.6 5.1z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}

function EyeIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.75 10s2.55-5.75 8.25-5.75S18.25 10 18.25 10s-2.55 5.75-8.25 5.75S1.75 10 1.75 10Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle
        cx="10"
        cy="10"
        r="2.25"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export default function SignupForm({
  onSuccess,
  onSwitchToSignin,
}: SignupFormProps) {
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState('');
  const [formData, setFormData] =
    useState({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
    });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response =
        await fetch(
          '/api/auth/signup',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(
              formData
            ),
          }
        );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | {
              success?: boolean;
              message?: string;
            }
          | null;

      if (
        !response.ok ||
        !data?.success
      ) {
        setError(
          data?.message ||
            'Signup failed'
        );
        return;
      }

      await onSuccess();

      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
      });
    } catch (error) {
      console.error(
        'Signup Error:',
        error
      );
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-6 pb-6 pt-14 sm:px-10 sm:pb-8 sm:pt-16">
      <div className="pb-6 pt-1">
        <h2 className="text-center text-[22px] font-semibold tracking-[-0.02em] text-zinc-900 sm:text-[24px]">
          Create your account
        </h2>

        <p className="mt-1 text-center text-[15px] text-zinc-500">
          Welcome! Please fill in the details to get started.
        </p>
      </div>

      <GoogleButton />

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-[15px] text-zinc-500">
          or
        </span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form
        className="space-y-6"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[15px] font-medium text-zinc-800">
                First name
              </label>

              <span className="text-[13px] text-zinc-500">
                Optional
              </span>
            </div>

            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
              autoComplete="given-name"
              autoFocus
              required
              className="h-11 w-full rounded-[10px] border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[15px] font-medium text-zinc-800">
                Last name
              </label>

              <span className="text-[13px] text-zinc-500">
                Optional
              </span>
            </div>

            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
              autoComplete="family-name"
              required
              className="h-11 w-full rounded-[10px] border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[15px] font-medium text-zinc-800">
            Username
          </label>

          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            required
            className="h-11 w-full rounded-[10px] border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[15px] font-medium text-zinc-800">
            Email address
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
            className="h-11 w-full rounded-[10px] border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[15px] font-medium text-zinc-800">
            Password
          </label>

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="h-11 w-full rounded-[10px] border border-zinc-200 bg-white px-4 pr-12 text-[15px] text-zinc-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300"
            />

            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-400">
              <EyeIcon />
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-[10px] bg-gradient-to-b from-zinc-600 to-zinc-700 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_2px_6px_rgba(0,0,0,0.16)] transition hover:from-zinc-500 hover:to-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
        >
          <span>
            {loading
              ? 'Creating Account...'
              : 'Continue'}
          </span>

          {!loading ? (
            <svg
              className="h-3.5 w-3.5 opacity-80"
              viewBox="0 0 12 12"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4.2 2.5 8 6l-3.8 3.5z" />
            </svg>
          ) : null}
        </button>
      </form>

      <div className="mt-6 border-t border-zinc-200 py-4 text-center">
        <p className="text-[15px] text-zinc-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignin}
            className="font-semibold text-zinc-900 transition hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
