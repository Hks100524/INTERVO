import Link from 'next/link';

import AssessmentHistoryCard from '@/components/assessment/AssessmentHistoryCard';
import AssessmentSummaryCard from '@/components/assessment/AssessmentSummaryCard';

const mockHistory = [
  {
    company: 'Google',
    modeLabel: 'Resume',
    difficulty: 'Medium',
    score: 84,
    status: 'Completed',
    date: 'Aug 12, 2026',
    href: '/assessment/result/demo-assessment',
  },
  {
    company: 'Stripe',
    modeLabel: 'Topic',
    difficulty: 'Hard',
    score: 76,
    status: 'Completed',
    date: 'Aug 08, 2026',
    href: '/assessment/result/demo-assessment',
  },
  {
    company: 'Meta',
    modeLabel: 'Resume',
    difficulty: 'Medium',
    score: 81,
    status: 'Completed',
    date: 'Aug 01, 2026',
    href: '/assessment/result/demo-assessment',
  },
  {
    company: 'Amazon',
    modeLabel: 'Topic',
    difficulty: 'Easy',
    score: 68,
    status: 'Completed',
    date: 'Jul 24, 2026',
    href: '/assessment/result/demo-assessment',
  },
];

export default function AssessmentHistoryPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 animate-fadeIn sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
                Assessment History
              </div>

              <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                History Preview
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
                Track past assessment attempts in a layout that matches the rest of INTERVO without using live data.
              </p>
            </div>

            <Link
              href="/assessment"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500"
            >
              Back to Assessment
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <AssessmentSummaryCard
            title="Assessment Snapshot"
            description="A static overview of history metrics and progress, ready for future analytics integration."
            metrics={[
              {
                label: 'Total Attempts',
                value: '12',
                note: 'Mock total from history preview',
                tone: 'blue',
              },
              {
                label: 'Average Score',
                value: '77%',
                note: 'Preview score only',
                tone: 'emerald',
              },
              {
                label: 'Best Score',
                value: '92%',
                note: 'Highest preview score',
                tone: 'violet',
              },
              {
                label: 'In Progress',
                value: '2',
                note: 'Draft attempts shown in UI',
                tone: 'amber',
              },
            ]}
          />

          <div className="rounded-2xl border border-gray-700/50 bg-black/30 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Recent Attempts
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Every history item below is mock content used for the UI skeleton.
                </p>
              </div>

              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
                Preview Mode
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {mockHistory.map((item) => (
                <AssessmentHistoryCard
                  key={`${item.company}-${item.date}`}
                  company={item.company}
                  modeLabel={item.modeLabel}
                  difficulty={item.difficulty}
                  score={item.score}
                  status={item.status}
                  date={item.date}
                  href={item.href}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
