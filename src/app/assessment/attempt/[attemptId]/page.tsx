'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import AssessmentQuestionCard from '@/components/assessment/AssessmentQuestionCard';
import AssessmentSummaryCard from '@/components/assessment/AssessmentSummaryCard';
import type {
  AssessmentAnswer,
  AssessmentAnswerValue,
  AssessmentMode,
  AssessmentQuestion,
  AssessmentStatus,
} from '@/lib/assessment/types';
import { isNonEmptyString } from '@/lib/assessment/validators';

type NormalizedQuestion = AssessmentQuestion & {
  questionId: string;
  type: NonNullable<AssessmentQuestion['type']>;
  options: string[];
};

type AssessmentAttemptResponse = {
  success?: boolean;
  assessment?: {
    id: string;
    mode: AssessmentMode;
    company: string;
    difficulty: string;
    questions: AssessmentQuestion[];
    answers: AssessmentAnswer[];
    score: number | null;
    evaluation: unknown;
    status: AssessmentStatus;
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
  message?: string;
};

type AssessmentSubmitResponse = {
  success?: boolean;
  assessmentId?: string;
  status?: string;
  result?: unknown;
  error?: string;
  message?: string;
};

function normalizeQuestion(
  question: AssessmentQuestion,
  index: number
): NormalizedQuestion {
  const questionId =
    isNonEmptyString(question.questionId)
      ? question.questionId.trim()
      : `question-${index + 1}`;
  const options = Array.isArray(question.options)
    ? question.options.filter(
        (option): option is string =>
          typeof option === 'string'
      )
    : [];

  return {
    ...question,
    questionId,
    type:
      question.type ??
      (options.length > 0
        ? 'multiple_choice'
        : 'custom'),
    options,
  };
}

function hasMeaningfulAnswer(
  value: AssessmentAnswerValue
) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

function getFriendlyLoadError(
  status: number,
  message?: string
) {
  if (status === 400) {
    return 'Invalid assessment id.';
  }

  if (status === 401) {
    return 'Please sign in to continue.';
  }

  if (status === 404) {
    return 'Assessment not found.';
  }

  return message || 'Failed to load the assessment.';
}

function getFriendlySubmitError(
  status: number,
  message?: string
) {
  if (status === 400) {
    return 'Please review your answers and try again.';
  }

  if (status === 401) {
    return 'Please sign in to submit your assessment.';
  }

  if (status === 404) {
    return 'Assessment not found.';
  }

  return message || 'Failed to submit the assessment.';
}

export default function AssessmentAttemptPage() {
  const router = useRouter();
  const params = useParams<{
    attemptId?: string | string[];
  }>();

  const attemptIdParam = params?.attemptId;
  const attemptId = Array.isArray(attemptIdParam)
    ? attemptIdParam[0]
    : attemptIdParam;

  const [assessment, setAssessment] =
    useState<{
      id: string;
      mode: AssessmentMode;
      company: string;
      difficulty: string;
      questions: NormalizedQuestion[];
      answers: AssessmentAnswer[];
      score: number | null;
      evaluation: unknown;
      status: AssessmentStatus;
      submittedAt: string | null;
      createdAt: string;
      updatedAt: string;
    } | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, AssessmentAnswerValue>
  >({});
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [reloadKey, setReloadKey] =
    useState(0);
  const [loadError, setLoadError] =
    useState('');
  const [submitError, setSubmitError] =
    useState('');

  useEffect(() => {
    if (!isNonEmptyString(attemptId)) {
      setLoadError('Invalid assessment id.');
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const loadAssessment = async () => {
      setIsLoading(true);
      setLoadError('');
      setSubmitError('');

      try {
        const response = await fetch(
          `/api/assessment/${attemptId}`,
          {
            method: 'GET',
            credentials: 'include',
            signal: controller.signal,
          }
        );

        const data = (await response
          .json()
          .catch(() => null)) as AssessmentAttemptResponse | null;

        if (!response.ok || !data?.success || !data.assessment) {
          if (!active) {
            return;
          }

          setLoadError(
            getFriendlyLoadError(
              response.status,
              data?.error || data?.message
            )
          );
          setAssessment(null);
          setAnswers({});
          return;
        }

        const normalizedQuestions = data.assessment.questions.map(
          normalizeQuestion
        );

        const initialAnswers: Record<
          string,
          AssessmentAnswerValue
        > = {};

        normalizedQuestions.forEach((question) => {
          const savedAnswer = data.assessment?.answers.find(
            (answer) =>
              answer.questionId === question.questionId
          );

          initialAnswers[question.questionId] =
            savedAnswer?.answer ?? null;
        });

        if (!active) {
          return;
        }

        setAssessment({
          ...data.assessment,
          questions: normalizedQuestions,
        });
        setAnswers(initialAnswers);
      } catch (error) {
        if (!active) {
          return;
        }

        console.error('Assessment load error:', error);
        setLoadError(
          'Could not load the assessment. Please try again.'
        );
        setAssessment(null);
        setAnswers({});
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadAssessment();

    return () => {
      active = false;
      controller.abort();
    };
  }, [attemptId, reloadKey]);

  const handleAnswerChange = (
    questionId: string,
    value: AssessmentAnswerValue
  ) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));

    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!assessment || isSubmitting) {
      return;
    }

    if (!isNonEmptyString(attemptId)) {
      setSubmitError('Invalid assessment id.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        answers: assessment.questions.map((question) => ({
          questionId: question.questionId,
          answer:
            answers[question.questionId] ?? null,
        })),
      };

      const response = await fetch(
        `/api/assessment/${attemptId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as AssessmentSubmitResponse | null;

      if (!response.ok || !data?.success) {
        setSubmitError(
          getFriendlySubmitError(
            response.status,
            data?.error || data?.message
          )
        );
        return;
      }

      router.replace(`/assessment/result/${attemptId}`);
    } catch (error) {
      console.error('Assessment submit error:', error);
      setSubmitError(
        'Network error. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = assessment
    ? assessment.questions.filter((question) =>
        hasMeaningfulAnswer(
          answers[question.questionId] ?? null
        )
      ).length
    : 0;

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="w-full max-w-xl rounded-2xl border border-gray-700/50 bg-black/30 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-blue-200/80">
              Loading assessment...
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Please wait while we fetch your quiz.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (loadError || !assessment) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="w-full rounded-3xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-black/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
            <div className="inline-flex rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-rose-200">
              Assessment Attempt
            </div>

            <h1 className="mt-4 text-3xl font-bold text-white">
              Unable to load assessment
            </h1>

            <p className="mt-3 text-sm leading-7 text-gray-300">
              {loadError || 'The assessment could not be loaded.'}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isNonEmptyString(attemptId)) {
                    setReloadKey((value) => value + 1);
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500"
              >
                Retry
              </button>

              <Link
                href="/assessment"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
              >
                Back to Assessment
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
              <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                Assessment Attempt
              </div>

              <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {assessment.company} Assessment
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
                Answer the questions below. Your answers stay in local React state until you submit the assessment.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
              >
                Back to Assessment
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <form
            className="space-y-4 sm:space-y-5"
            onSubmit={handleSubmit}
          >
            {assessment.questions.map((question, index) => (
              <AssessmentQuestionCard
                key={question.questionId}
                index={index + 1}
                question={question.question}
                type={question.type}
                options={question.options}
                placeholder="Type your answer here..."
                answer={answers[question.questionId] ?? null}
                onAnswerChange={(value) =>
                  handleAnswerChange(
                    question.questionId,
                    value
                  )
                }
                disabled={isSubmitting}
              />
            ))}

            {submitError ? (
              <div
                className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                role="alert"
                aria-live="polite"
              >
                {submitError}
              </div>
            ) : null}

            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200/80">
                    Submit Assessment
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    Submit when you are ready to send your answers for evaluation.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Assessment</span>
                  )}
                </button>
              </div>
            </div>
          </form>

          <aside className="space-y-5">
            <AssessmentSummaryCard
              title="Assessment Overview"
              description="Live attempt state for the current assessment."
              metrics={[
                {
                  label: 'Company',
                  value: assessment.company,
                  note: 'Target company',
                  tone: 'violet',
                },
                {
                  label: 'Difficulty',
                  value:
                    assessment.difficulty.charAt(0).toUpperCase() +
                    assessment.difficulty.slice(1),
                  note: 'Assessment difficulty',
                  tone: 'blue',
                },
                {
                  label: 'Mode',
                  value:
                    assessment.mode === 'resume'
                      ? 'Resume'
                      : 'Topic',
                  note: 'Intake mode',
                  tone: 'emerald',
                },
                {
                  label: 'Answered',
                  value: `${answeredCount}/${assessment.questions.length}`,
                  note: 'Stored in local state only',
                  tone: 'amber',
                },
              ]}
            />

            <div className="rounded-2xl border border-gray-700/50 bg-black/30 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
                Answer Progress
              </p>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                  style={{
                    width: `${
                      assessment.questions.length > 0
                        ? Math.round(
                            (answeredCount /
                              assessment.questions.length) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
                <span>{answeredCount} answered</span>
                <span>
                  {assessment.questions.length - answeredCount} remaining
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-400">
                Answers are kept in React state only until you press submit.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
