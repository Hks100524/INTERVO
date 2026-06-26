type SummaryTone = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose';

export interface AssessmentSummaryMetric {
  label: string;
  value: string;
  note?: string;
  tone?: SummaryTone;
}

interface AssessmentSummaryCardProps {
  title: string;
  description?: string;
  metrics: AssessmentSummaryMetric[];
}

const toneClasses: Record<SummaryTone, string> = {
  blue: 'from-blue-500 to-purple-600 text-blue-200',
  emerald: 'from-emerald-500 to-green-500 text-emerald-200',
  violet: 'from-violet-500 to-fuchsia-500 text-violet-200',
  amber: 'from-amber-500 to-orange-500 text-amber-200',
  rose: 'from-rose-500 to-pink-500 text-rose-200',
};

export default function AssessmentSummaryCard({
  title,
  description,
  metrics,
}: AssessmentSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-black/40 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-white sm:text-2xl">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              {description}
            </p>
          ) : null}
        </div>

        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
          Assessment Snapshot
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const tone = metric.tone ?? 'blue';
          const accent = toneClasses[tone];

          return (
            <div
              key={metric.label}
              className="rounded-xl border border-gray-700/50 bg-white/5 p-4"
            >
              <div
                className={[
                  'inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                  accent,
                ].join(' ')}
              >
                {metric.label}
              </div>

              <p className="mt-4 text-3xl font-extrabold text-white">
                {metric.value}
              </p>

              {metric.note ? (
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {metric.note}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
