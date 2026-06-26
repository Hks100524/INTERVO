interface AssessmentResultCardProps {
  score: number;
  title: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  badgeLabel?: string;
  scoreLabel?: string;
  scoreCaption?: string;
  improvementsLabel?: string;
}

export default function AssessmentResultCard({
  score,
  title,
  summary,
  strengths,
  improvements,
  recommendations,
  badgeLabel = 'Mock Evaluation',
  scoreLabel = 'Readiness Score',
  scoreCaption = 'Strong potential, with room to sharpen depth.',
  improvementsLabel = 'Growth Areas',
}: AssessmentResultCardProps) {
  return (
    <section className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-black/40 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            {badgeLabel}
          </div>

          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-300 sm:text-base">
            {summary}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-700/50 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Strengths
              </p>
              <ul className="mt-3 space-y-2">
                {strengths.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-6 text-gray-200"
                  >
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-gray-700/50 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                {improvementsLabel}
              </p>
              <ul className="mt-3 space-y-2">
                {improvements.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-6 text-gray-200"
                  >
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-gray-700/50 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Recommendations
              </p>
              <ul className="mt-3 space-y-2">
                {recommendations.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-6 text-gray-200"
                  >
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 lg:min-w-56 lg:items-center lg:justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-blue-400/30 bg-black/30 shadow-lg shadow-blue-500/10">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-white">
                {score}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                / 100
              </p>
            </div>
          </div>

          <div className="text-left lg:text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200/80">
              {scoreLabel}
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              {scoreCaption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
