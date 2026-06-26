'use client';

interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  active?: boolean;
  disabled?: boolean;
}

function TopicIcon() {
  return (
    <svg
      className="h-5 w-5 text-white"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v4A3.5 3.5 0 0 1 16.5 15H11l-4.5 4.5V15H7.5A3.5 3.5 0 0 1 4 11.5v-4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8 8.5h8M8 11h5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function TopicInput({
  value,
  onChange,
  error,
  active = true,
  disabled = false,
}: TopicInputProps) {
  const inputDisabled = disabled || !active;

  return (
    <div
      className={[
        'rounded-2xl border p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md transition-opacity',
        active
          ? 'border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-black/40'
          : 'border-gray-700/40 bg-white/5 opacity-75',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
          <TopicIcon />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
              Topic Input
            </p>

            <span
              className={[
                'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                active
                  ? 'bg-emerald-500/15 text-emerald-200'
                  : 'bg-white/5 text-gray-400',
              ].join(' ')}
            >
              {active ? 'Selected' : 'Inactive'}
            </span>
          </div>

          <h3 className="mt-1 text-lg font-bold text-white">
            Enter the assessment topic
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            Use this when you want a focused quiz around a specific skill area or domain.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-gray-300">
            Topic
          </span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={inputDisabled}
            placeholder="Frontend architecture and system design"
            aria-invalid={Boolean(error)}
            className={[
              'w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500',
              inputDisabled
                ? 'cursor-not-allowed border-gray-700/40 bg-gray-950/60 text-gray-400'
                : 'border-gray-700/50 bg-gray-900/70 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15',
            ].join(' ')}
          />
        </label>

        <div className="rounded-xl border border-gray-700/50 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Suggested focus
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            Architecture decisions, trade-offs, performance, and collaboration patterns.
          </p>
        </div>

        {error ? (
          <p className="text-sm text-rose-300">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
