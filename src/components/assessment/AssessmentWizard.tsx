'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import CompanySelector from '@/components/assessment/CompanySelector';
import DifficultySelector from '@/components/assessment/DifficultySelector';
import IntakeModeSelector from '@/components/assessment/IntakeModeSelector';
import ResumeUploader from '@/components/assessment/ResumeUploader';
import TopicInput from '@/components/assessment/TopicInput';
import type { AssessmentMode } from '@/lib/assessment/types';
import {
  isAssessmentMode,
  isNonEmptyString,
} from '@/lib/assessment/validators';

type FieldErrors = {
  form?: string;
  resumeText?: string;
  topic?: string;
  company?: string;
  difficulty?: string;
};

const DEFAULT_QUESTION_COUNT = 5;

function getFriendlyApiError(
  status: number,
  message?: string
) {
  if (status === 401) {
    return 'Please sign in to generate an assessment.';
  }

  if (status === 502 || status === 503) {
    return 'Assessment generation is temporarily unavailable. Please try again.';
  }

  return message || 'Unable to generate assessment. Please try again.';
}

export default function AssessmentWizard() {
  const router = useRouter();

  const [mode, setMode] =
    useState<AssessmentMode>('resume');
  const [resumeText, setResumeText] =
    useState('');
  const [topic, setTopic] =
    useState('');
  const [company, setCompany] =
    useState('Google');
  const [difficulty, setDifficulty] =
    useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] =
    useState(false);
  const [apiError, setApiError] =
    useState('');
  const [errors, setErrors] =
    useState<FieldErrors>({});

  const clearErrors = (...keys: (keyof FieldErrors)[]) => {
    if (keys.length === 0) {
      setErrors({});
      return;
    }

    setErrors((current) => {
      const next = { ...current };

      for (const key of keys) {
        delete next[key];
      }

      return next;
    });
  };

  const handleModeChange = (
    nextMode: AssessmentMode
  ) => {
    setMode(nextMode);
    setApiError('');
    clearErrors('form', 'resumeText', 'topic');
  };

  const handleResumeChange = (value: string) => {
    setResumeText(value);

    if (apiError) {
      setApiError('');
    }

    if (errors.resumeText) {
      clearErrors('resumeText');
    }
  };

  const handleTopicChange = (value: string) => {
    setTopic(value);

    if (apiError) {
      setApiError('');
    }

    if (errors.topic) {
      clearErrors('topic');
    }
  };

  const handleCompanyChange = (value: string) => {
    setCompany(value);

    if (apiError) {
      setApiError('');
    }

    if (errors.company) {
      clearErrors('company');
    }
  };

  const handleDifficultyChange = (
    value: 'easy' | 'medium' | 'hard'
  ) => {
    setDifficulty(value);

    if (apiError) {
      setApiError('');
    }

    if (errors.difficulty) {
      clearErrors('difficulty');
    }
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};

    if (!isAssessmentMode(mode)) {
      nextErrors.form =
        'Choose Resume or Topic before generating the assessment.';
    }

    if (mode === 'resume' && !isNonEmptyString(resumeText)) {
      nextErrors.resumeText =
        'Paste your resume text to continue.';
    }

    if (mode === 'topic' && !isNonEmptyString(topic)) {
      nextErrors.topic =
        'Enter a topic to continue.';
    }

    if (!isNonEmptyString(company)) {
      nextErrors.company =
        'Choose a target company.';
    }

    if (!isNonEmptyString(difficulty)) {
      nextErrors.difficulty =
        'Choose a difficulty level.';
    }

    return nextErrors;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isGenerating) {
      return;
    }

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsGenerating(true);
    setErrors({});
    setApiError('');

    try {
      const payload =
        mode === 'resume'
          ? {
              mode,
              resumeText: resumeText.trim(),
              company,
              difficulty,
              questionCount: DEFAULT_QUESTION_COUNT,
            }
          : {
              mode,
              topic: topic.trim(),
              company,
              difficulty,
              questionCount: DEFAULT_QUESTION_COUNT,
            };

      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = (await response
        .json()
        .catch(() => null)) as
        | {
            success?: boolean;
            assessmentId?: string;
            error?: string;
            message?: string;
          }
        | null;

      if (!response.ok || !data?.success) {
        setApiError(
          getFriendlyApiError(
            response.status,
            data?.error || data?.message
          )
        );
        setIsGenerating(false);
        return;
      }

      if (
        typeof data.assessmentId !== 'string' ||
        !data.assessmentId.trim()
      ) {
        setApiError(
          'Assessment was created but no redirect id was returned.'
        );
        setIsGenerating(false);
        return;
      }

      setIsGenerating(false);
      router.replace(
        `/assessment/attempt/${data.assessmentId}`
      );
    } catch (error) {
      console.error('Assessment generation error:', error);
      setApiError(
        'Network error. Please check your connection and try again.'
      );
      setIsGenerating(false);
    }
  };

  const bannerMessage = apiError || errors.form || '';

  return (
    <section className="rounded-3xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-black/40 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
            Assessment Builder
          </span>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            Shape a company-standard assessment preview
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
            Choose a resume or topic, pick a company, set a difficulty level, and generate the first assessment attempt.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
          Ready to generate
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          '1. Intake mode',
          '2. Company',
          '3. Difficulty',
          '4. Generate',
        ].map((step, index) => (
          <div
            key={step}
            className="rounded-xl border border-gray-700/50 bg-white/5 px-4 py-3"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Step {index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {step}
            </p>
          </div>
        ))}
      </div>

      {bannerMessage ? (
        <div
          className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
          role="alert"
          aria-live="polite"
        >
          {bannerMessage}
        </div>
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <IntakeModeSelector
          selectedMode={mode}
          onChange={handleModeChange}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <ResumeUploader
            value={resumeText}
            onChange={handleResumeChange}
            error={
              mode === 'resume' ? errors.resumeText : undefined
            }
            active={mode === 'resume'}
            disabled={isGenerating}
          />
          <TopicInput
            value={topic}
            onChange={handleTopicChange}
            error={mode === 'topic' ? errors.topic : undefined}
            active={mode === 'topic'}
            disabled={isGenerating}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <CompanySelector
            selectedCompany={company}
            onChange={handleCompanyChange}
            error={errors.company}
            disabled={isGenerating}
          />
          <DifficultySelector
            selectedDifficulty={difficulty}
            onChange={handleDifficultyChange}
            error={errors.difficulty}
            disabled={isGenerating}
          />
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200/80">
                Generate Assessment
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Create the assessment and redirect directly to the attempt page.
              </p>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span>Generating...</span>
                </>
              ) : (
                <span>Generate Assessment</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
