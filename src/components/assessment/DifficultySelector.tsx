'use client';

type DifficultyOption = {
  value: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  accent: string;
};

interface DifficultySelectorProps {
  selectedDifficulty: 'easy' | 'medium' | 'hard';
  onChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  error?: string;
  disabled?: boolean;
}

const difficulties: DifficultyOption[] = [
  {
    value: 'easy',
    title: 'Easy',
    description: 'Foundational coverage and warm-up style questions.',
    accent: 'from-emerald-500 to-cyan-500',
  },
  {
    value: 'medium',
    title: 'Medium',
    description: 'Balanced depth with practical trade-offs.',
    accent: 'from-blue-500 to-purple-600',
  },
  {
    value: 'hard',
    title: 'Hard',
    description: 'Deeper reasoning, edge cases, and system-level thinking.',
    accent: 'from-rose-500 to-orange-500',
  },
];

export default function DifficultySelector({
  selectedDifficulty,
  onChange,
  error,
  disabled = false,
}: DifficultySelectorProps) {
  return (
    <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-black/40 p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200/80">
            Difficulty
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">
            Pick the assessment intensity
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            Difficulty changes the depth, breadth, and company-standard expectations in the preview.
          </p>
        </div>

        <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
          {selectedDifficulty}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {difficulties.map((difficulty) => {
          const active = difficulty.value === selectedDifficulty;

          return (
            <button
              key={difficulty.value}
              type="button"
              onClick={() => onChange(difficulty.value)}
              disabled={disabled}
              aria-pressed={active}
              className={[
                'rounded-xl border p-4 text-left transition-all duration-300',
                active
                  ? 'border-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-gray-700/50 bg-white/5 hover:border-gray-600/70 hover:bg-white/10',
                disabled ? 'cursor-not-allowed opacity-75' : '',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <div
                  className={[
                    'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
                    difficulty.accent,
                  ].join(' ')}
                >
                  <span className="text-sm font-bold text-white">
                    {difficulty.title.slice(0, 1)}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    {difficulty.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {difficulty.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
