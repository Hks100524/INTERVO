'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useEffect,
  useState,
} from 'react';

import AssessmentResultCard from '@/components/assessment/AssessmentResultCard';
import AssessmentSummaryCard from '@/components/assessment/AssessmentSummaryCard';
import type {
  AssessmentAnswer,
  AssessmentMode,
  AssessmentQuestion,
  AssessmentStatus,
} from '@/lib/assessment/types';
import { ensureStringArray, normalizeWhitespace, toSafeString } from '@/lib/assessment/helpers';
import {
  calculateAssessmentScore,
  getAssessmentReadinessLabel,
} from '@/lib/assessment/score';
import { isNonEmptyString, isRecord } from '@/lib/assessment/validators';

type NormalizedQuestion = AssessmentQuestion & {
  questionId: string;
};

type ResultEvaluation = {
  summary?: string;
  feedback?: string;
  strengths?: unknown;
  improvements?: unknown;
  recommendations?: unknown;
  readinessLevel?: string;
  scoreBreakdown?: Record<string, unknown>;
};

type AssessmentResultResponse = {
  success?: boolean;
  assessment?: {
    id: string;
    mode: AssessmentMode;
    company: string;
    difficulty: string;
    questions: AssessmentQuestion[];
    answers: AssessmentAnswer[];
    score: number | null;
    evaluation: ResultEvaluation | null;
    status: AssessmentStatus;
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
  message?: string;
};

function normalizeQuestion(question: AssessmentQuestion): NormalizedQuestion {
  return {
    ...question,
    questionId: isNonEmptyString(question.questionId)
      ? question.questionId.trim()
      : question.question.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  };
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function extractErrorMessage(
  status: number,
  message?: string
) {
  if (status === 400) {
    return 'Invalid assessment id.';
  }

  if (status === 401) {
    return 'Please sign in to view this result.';
  }

  if (status === 404) {
    return 'Assessment result not found.';
  }

  return message || 'Failed to load the assessment result.';
}

export default function AssessmentResultPage() {
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
      evaluation: ResultEvaluation | null;
      status: AssessmentStatus;
      submittedAt: string | null;
      createdAt: string;
      updatedAt: string;
    } | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [reloadKey, setReloadKey] =
    useState(0);
  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!isNonEmptyString(attemptId)) {
      setError('Invalid assessment id.');
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const loadResult = async () => {
      setIsLoading(true);
      setError('');

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
          .catch(() => null)) as AssessmentResultResponse | null;

        if (!response.ok || !data?.success || !data.assessment) {
          if (!active) {
            return;
          }

          setAssessment(null);
          setError(
            extractErrorMessage(
              response.status,
              data?.error || data?.message
            )
          );
          return;
        }

        const normalizedQuestions =
          data.assessment.questions.map(normalizeQuestion);

        if (!active) {
          return;
        }

        setAssessment({
          ...data.assessment,
          questions: normalizedQuestions,
        });
      } catch (fetchError) {
        if (!active) {
          return;
        }

        console.error('Assessment result load error:', fetchError);
        setAssessment(null);
        setError(
          'Could not load the assessment result. Please try again.'
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadResult();

    return () => {
      active = false;
      controller.abort();
    };
  }, [attemptId, reloadKey]);

  const scoreBreakdown = isRecord(
    assessment?.evaluation?.scoreBreakdown
  )
    ? assessment?.evaluation?.scoreBreakdown
    : null;
  const totalQuestions =
    toNumber(scoreBreakdown?.totalQuestions) ??
    assessment?.questions.length ??
    0;
  const correctAnswers =
    toNumber(scoreBreakdown?.correctAnswers) ??
    assessment?.answers.filter((answer) => answer.isCorrect)
      .length ??
    0;
  const wrongAnswers =
    toNumber(scoreBreakdown?.incorrectAnswers) ??
    Math.max(totalQuestions - correctAnswers, 0);
  const score =
    assessment?.score ??
    toNumber(scoreBreakdown?.score) ??
    calculateAssessmentScore(correctAnswers, totalQuestions);
  const derivedPerformanceBadge =
    normalizeWhitespace(
      toSafeString(
        assessment?.evaluation?.readinessLevel
      )
    ) ||
    getAssessmentReadinessLabel(score);
  const feedback =
    normalizeWhitespace(
      toSafeString(
        assessment?.evaluation?.feedback ||
          assessment?.evaluation?.summary
      )
    ) ||
    'Your assessment has been evaluated successfully.';
  const strengths = ensureStringArray(
    assessment?.evaluation?.strengths
  );
  const weaknesses = ensureStringArray(
    assessment?.evaluation?.improvements
  );
  const recommendations = ensureStringArray(
    assessment?.evaluation?.recommendations
  );

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
              Loading result...
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Please wait while we fetch the assessment result.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !assessment) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="w-full rounded-3xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-black/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
            <div className="inline-flex rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-rose-200">
              Assessment Result
            </div>

            <h1 className="mt-4 text-3xl font-bold text-white">
              Unable to load result
            </h1>

            <p className="mt-3 text-sm leading-7 text-gray-300">
              {error || 'The assessment result could not be loaded.'}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500"
              >
                Retry Load
              </button>

              <Link
                href="/assessment"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
              >
                Back to Assessment Home
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
              <div className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">
                Assessment Result
              </div>

              <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {assessment.company} Result
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
                Review the AI evaluation, performance badge, and the key strengths and weaknesses captured from the submitted assessment.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/assessment/attempt/${assessment.id}`}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500"
              >
                Retry Assessment
              </Link>

              <Link
                href="/assessment"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
              >
                Back to Assessment Home
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <AssessmentSummaryCard
              title="Result Snapshot"
              description="Core metrics from the submitted assessment."
              metrics={[
                {
                  label: 'Overall Score',
                  value: `${score} / 100`,
                  note: 'Overall assessment score',
                  tone: 'blue',
                },
                {
                  label: 'Percentage',
                  value: `${score}%`,
                  note: 'Score expressed as a percentage',
                  tone: 'emerald',
                },
                {
                  label: 'Total Questions',
                  value: `${totalQuestions}`,
                  note: 'Questions in this assessment',
                  tone: 'violet',
                },
                {
                  label: 'Correct Answers',
                  value: `${correctAnswers}`,
                  note: 'Answers marked correct',
                  tone: 'amber',
                },
                {
                  label: 'Wrong Answers',
                  value: `${wrongAnswers}`,
                  note: 'Answers needing review',
                  tone: 'rose',
                },
                {
                  label: 'Performance Badge',
                  value: derivedPerformanceBadge,
                  note: 'AI readiness level',
                  tone: 'blue',
                },
              ]}
            />

            <AssessmentResultCard
              badgeLabel="AI Evaluation"
              score={score}
              title="AI Feedback"
              summary={feedback}
              strengths={strengths}
              improvements={weaknesses}
              recommendations={recommendations}
              scoreLabel="Overall Score"
              scoreCaption={`Performance Badge: ${derivedPerformanceBadge}`}
              improvementsLabel="Weaknesses"
            />
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-gray-700/50 bg-black/30 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
                Quick Actions
              </p>

              <div className="mt-4 space-y-3">
                <Link
                  href={`/assessment/attempt/${assessment.id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500"
                >
                  Retry Assessment
                </Link>

                <Link
                  href="/assessment"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
                >
                  Back to Assessment Home
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700/50 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
                Evaluation Status
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-gray-300">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-700/50 bg-black/30 px-4 py-3">
                  <span>Performance</span>
                  <span className="font-semibold text-white">
                    {derivedPerformanceBadge}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-700/50 bg-black/30 px-4 py-3">
                  <span>Status</span>
                  <span className="font-semibold text-white">
                    {assessment.status}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-700/50 bg-black/30 px-4 py-3">
                  <span>Submitted</span>
                  <span className="font-semibold text-white">
                    {assessment.submittedAt
                      ? new Date(
                          assessment.submittedAt
                        ).toLocaleString()
                      : 'Not available'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700/50 bg-black/30 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
                AI Feedback
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-300">
                {feedback}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
