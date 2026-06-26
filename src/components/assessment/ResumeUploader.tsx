'use client';

interface ResumeUploaderProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  active?: boolean;
  disabled?: boolean;
}

function UploadIcon() {
  return (
    <svg
      className="h-5 w-5 text-white"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 16.75V7.25"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="m8.75 10 3.25-3.25L15.25 10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.75 16.5a3.25 3.25 0 0 1 3.25-3.25h6a3.25 3.25 0 0 1 3.25 3.25V18A2.25 2.25 0 0 1 16 20.25H8A2.25 2.25 0 0 1 5.75 18v-1.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ResumeUploader({
  value,
  onChange,
  error,
  active = true,
  disabled = false,
}: ResumeUploaderProps) {
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
          <UploadIcon />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200/80">
              Resume Upload
            </p>

            <span
              className={[
                'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                active
                  ? 'bg-blue-500/15 text-blue-200'
                  : 'bg-white/5 text-gray-400',
              ].join(' ')}
            >
              {active ? 'Selected' : 'Inactive'}
            </span>
          </div>

          <h3 className="mt-1 text-lg font-bold text-white">
            Paste the candidate resume text
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            Use extracted resume text so the assessment can be tailored to the candidate&apos;s experience.
          </p>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-gray-300">
          Resume text
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={inputDisabled}
          placeholder="Frontend engineer with strong React, Next.js, and product thinking experience..."
          aria-invalid={Boolean(error)}
          className={[
            'min-h-40 w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-gray-500',
            inputDisabled
              ? 'cursor-not-allowed border-gray-700/40 bg-gray-950/60 text-gray-400'
              : 'border-gray-700/50 bg-gray-900/70 text-gray-100 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15',
          ].join(' ')}
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-400">
          This value is sent to Gemini as the assessment context.
        </p>

        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
          Resume input only
        </p>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
