'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
      </div>

      <div className="relative flex flex-col items-center p-6 min-h-screen">
        <div className="w-full max-w-6xl mt-10">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">

            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Dashboard
              </h1>

              <p className="text-gray-400 mt-2">
                Welcome to INTERVO Dashboard
              </p>
            </div>

            <Link
              href="/practice"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
            >
              New Practice
            </Link>

          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">

            <div className="bg-black/30 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-gray-400 text-sm">
                Total Sessions
              </h3>

              <p className="text-3xl font-bold text-white mt-2">
                0
              </p>
            </div>

            <div className="bg-black/30 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-gray-400 text-sm">
                Average Score
              </h3>

              <p className="text-3xl font-bold text-white mt-2">
                0%
              </p>
            </div>

            <div className="bg-black/30 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-gray-400 text-sm">
                Performance
              </h3>

              <p className="text-3xl font-bold text-green-400 mt-2">
                Beginner
              </p>
            </div>

          </div>

          {/* Session History */}
          <div className="bg-black/30 border border-gray-800 rounded-2xl p-6">

            <h2 className="text-2xl font-bold text-white mb-4">
              Session History
            </h2>

            <div className="text-center py-16">

              <p className="text-gray-400">
                No interview sessions found yet.
              </p>

              <Link
                href="/practice"
                className="inline-block mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white"
              >
                Start Your First Interview
              </Link>

            </div>

          </div>

        </div>
      </div>
    </main>
  );
}