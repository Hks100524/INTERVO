'use client';

import type { ReactNode } from 'react';

import type { AssessmentMode } from '@/lib/assessment/types';

type IntakeOption = {
  value: AssessmentMode;
  title: string;
  description: string;
  accent: string;
  icon: ReactNode;
};

interface IntakeModeSelectorProps {
  selectedMode: AssessmentMode;
  onChange: (mode: AssessmentMode) => void;
}

function ResumeIcon() {
  return (
    <svg
      className="h-5 w-5 text-white"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 3.75h7.25L19 8.5v11.75A1.75 1.75 0 0 1 17.25 22h-10.5A1.75 1.75 0 0 1 5 20.25V5.5A1.75 1.75 0 0 1 6.75 3.75Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14.25 3.75V8.5H19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 12h7.5M8.25 15.5h7.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
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
        d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v5.5A2.75 2.75 0 0 1 17.25 15H10l-4.5 4.5V15H6.75A2.75 2.75 0 0 1 4 12.25v-5.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8 8.5h8M8 11h5.25"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

const options: IntakeOption[] = [
  {
    value: 'resume',
    title: 'Resume Upload',
    description:
      'Use a resume to tailor the assessment to a candidate’s background and experience.',
    accent: 'from-blue-500 to-purple-600',
    icon: <ResumeIcon />,
  },
  {
    value: 'topic',
    title: 'Topic Input',
    description:
      'Start from a topic and shape the assessment around a specific skill area.',
    accent: 'from-emerald-500 to-cyan-500',
    icon: <TopicIcon />,
  },
];

export default function IntakeModeSelector({
  selectedMode,
  onChange,
}: IntakeModeSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {options.map((option) => {
        const active = option.value === selectedMode;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={[
              'rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5',
              active
                ? 'border-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                : 'border-gray-700/50 bg-white/5 hover:border-gray-600/70 hover:bg-white/10',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={[
                    'flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
                    option.accent,
                  ].join(' ')}
                >
                  {option.icon}
                </div>

                <div>
                  <p className="text-base font-semibold text-white">
                    {option.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    {option.value === 'resume'
                      ? 'Resume-led assessment'
                      : 'Topic-led assessment'}
                  </p>
                </div>
              </div>

              <span
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                  active
                    ? 'bg-blue-500/20 text-blue-200'
                    : 'bg-white/5 text-gray-400',
                ].join(' ')}
              >
                {active ? 'Selected' : 'Option'}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-300">
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
