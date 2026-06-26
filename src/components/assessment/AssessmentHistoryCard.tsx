import Link from 'next/link';

interface AssessmentHistoryCardProps {
  company: string;
  modeLabel: string;
  difficulty: string;
  score: number;
  status: string;
  date: string;
  href?: string;
}

export default function AssessmentHistoryCard({
  company,
  modeLabel,
  difficulty,
  score,
  status,
  date,
  href = '#',
}: AssessmentHistoryCardProps) {
  return (
    <article className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-black/40 p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white sm:text-xl">
              {company}
            </h3>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
              {modeLabel}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            Difficulty: {difficulty} • Completed on {date}
          </p>
        </div>

        <div className="flex items-center gap-3 sm:justify-end">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-right">
            <p className="text-2xl font-extrabold text-white">
              {score}%
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Score
            </p>
          </div>

          <div className="rounded-2xl border border-gray-700/50 bg-white/5 px-4 py-3 text-right">
            <p className="text-sm font-semibold text-white">
              {status}
            </p>
            <p className="text-xs text-gray-400">
              Assessment status
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-400">
          Preview the result details and assessment progression.
        </p>

        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500"
        >
          View Result Preview
        </Link>
      </div>
    </article>
  );
}
