'use client';

import Link from 'next/link';

import UserNav from '@/components/UserNav';

export default function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b border-gray-800/50 bg-black/50 px-4 backdrop-blur-md sm:h-16 sm:gap-4 sm:p-4">
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-2 text-base font-bold text-gray-100 transition-colors duration-200 hover:text-white sm:text-lg"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 sm:h-10 sm:w-10">
            <svg
              className="h-5 w-5 text-white sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>

          <span className="hidden xs:inline">
            AI Interview
          </span>
        </Link>

        <div className="hidden flex-1 items-center gap-6 md:flex md:ml-8">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-300 transition-colors duration-200 hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/practice"
            className="text-sm font-semibold text-gray-300 transition-colors duration-200 hover:text-white"
          >
            Practice
          </Link>

          <Link
            href="/assessment"
            className="text-sm font-semibold text-gray-300 transition-colors duration-200 hover:text-white"
          >
            AI Readiness
          </Link>

          <Link
            href="/dashboard"
            className="text-sm font-semibold text-gray-300 transition-colors duration-200 hover:text-white"
          >
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <UserNav />
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-800/50 bg-black/90 backdrop-blur-md md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          <Link
            href="/"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 transition-colors duration-200 hover:text-white"
          >
            <span className="text-xs font-medium">
              Home
            </span>
          </Link>

          <Link
            href="/practice"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 transition-colors duration-200 hover:text-white"
          >
            <span className="text-xs font-medium">
              Practice
            </span>
          </Link>

          <Link
            href="/assessment"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 transition-colors duration-200 hover:text-white"
          >
            <span className="text-xs font-medium">
              AI Readiness
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400 transition-colors duration-200 hover:text-white"
          >
            <span className="text-xs font-medium">
              Dashboard
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}
