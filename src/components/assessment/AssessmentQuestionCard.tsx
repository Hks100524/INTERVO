'use client';

import type { AssessmentAnswerValue, AssessmentQuestionType } from '@/lib/assessment/types';

interface AssessmentQuestionCardProps {
  index: number;
  question: string;
  type?: AssessmentQuestionType;
  options?: string[];
  placeholder?: string;
  answer?: AssessmentAnswerValue;
  onAnswerChange?: (value: AssessmentAnswerValue) => void;
  disabled?: boolean;
}

const typeLabels: Record<AssessmentQuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  short_answer: 'Short Answer',
  true_false: 'True / False',
  scenario: 'Scenario',
  custom: 'Custom',
};

function isSelected(
  currentAnswer: AssessmentAnswerValue,
  option: string
) {
  if (typeof currentAnswer !== 'string') {
    return false;
  }

  return currentAnswer.trim().toLowerCase() === option.trim().toLowerCase();
}

export default function AssessmentQuestionCard({
  index,
  question,
  type = 'multiple_choice',
  options = [],
  placeholder = 'Your answer preview appears here',
  answer = null,
  onAnswerChange,
  disabled = false,
}: AssessmentQuestionCardProps) {
  const hasOptions = options.length > 0;
  const isInteractive = typeof onAnswerChange === 'function';
  const selectedValue =
    typeof answer === 'string' ? answer : '';
  const renderChoiceButtons =
    isInteractive &&
    (hasOptions || type === 'true_false');
  const choiceOptions = hasOptions
    ? options
    : type === 'true_false'
      ? ['True', 'False']
      : [];

  return (
    <article className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-black/40 p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
          {index}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
              {typeLabels[type]}
            </span>
            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
              {isInteractive ? 'Attempt' : 'Preview'}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-bold leading-7 text-white sm:text-xl">
            {question}
          </h3>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-700/50 bg-black/30 p-4 sm:p-5">
        {isInteractive ? (
          renderChoiceButtons ? (
            <div className="space-y-3">
              {choiceOptions.map((option, optionIndex) => {
                const active = isSelected(selectedValue, option);

                return (
                  <button
                    key={`${option}-${optionIndex}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => onAnswerChange(option)}
                    className={[
                      'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition',
                      active
                        ? 'border-blue-400/60 bg-blue-500/15 shadow-lg shadow-blue-500/10'
                        : 'border-gray-700/50 bg-white/5 hover:border-gray-600/70 hover:bg-white/10',
                      disabled ? 'cursor-not-allowed opacity-80' : '',
                    ].join(' ')}
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-400/50">
                      {active ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        Option {optionIndex + 1}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-300">
                        {option}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Your answer
              </span>
              <textarea
                value={selectedValue}
                onChange={(event) =>
                  onAnswerChange(event.target.value)
                }
                disabled={disabled}
                placeholder={placeholder}
                className={[
                  'min-h-32 w-full resize-none rounded-xl border p-4 text-sm leading-6 outline-none transition placeholder:text-gray-500',
                  disabled
                    ? 'cursor-not-allowed border-gray-700/40 bg-gray-950/60 text-gray-400'
                    : 'border-gray-700/50 bg-gray-950/70 text-gray-100 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15',
                ].join(' ')}
              />
            </label>
          )
        ) : hasOptions ? (
          <div className="space-y-3">
            {options.map((option, optionIndex) => (
              <div
                key={`${option}-${optionIndex}`}
                className="flex items-start gap-3 rounded-xl border border-gray-700/50 bg-white/5 p-3"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-400/50">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-400/70" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    Option {optionIndex + 1}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-gray-300">
                    {option}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <textarea
            readOnly
            value={placeholder}
            className="min-h-32 w-full resize-none rounded-xl border border-gray-700/50 bg-gray-950/70 p-4 text-sm leading-6 text-gray-200 outline-none"
          />
        )}
      </div>
    </article>
  );
}
