import { clampNumber } from './helpers';

export function calculateAssessmentScore(
  correctAnswers: number,
  totalQuestions: number
): number {
  if (totalQuestions <= 0) {
    return 0;
  }

  const safeCorrectAnswers = clampNumber(
    correctAnswers,
    0,
    totalQuestions,
    0
  );

  return Math.round(
    (safeCorrectAnswers / totalQuestions) * 100
  );
}

export function calculateAssessmentAccuracy(
  correctAnswers: number,
  answeredQuestions: number
): number {
  if (answeredQuestions <= 0) {
    return 0;
  }

  const safeCorrectAnswers = clampNumber(
    correctAnswers,
    0,
    answeredQuestions,
    0
  );

  return Math.round(
    (safeCorrectAnswers / answeredQuestions) * 100
  );
}

export function getAssessmentReadinessLabel(
  score: number
): string {
  if (score >= 90) {
    return 'Interview Ready';
  }

  if (score >= 75) {
    return 'Strong';
  }

  if (score >= 60) {
    return 'Developing';
  }

  return 'Needs Practice';
}

export function getAssessmentScoreBand(
  score: number
): 'low' | 'mid' | 'high' | 'excellent' {
  if (score >= 90) {
    return 'excellent';
  }

  if (score >= 75) {
    return 'high';
  }

  if (score >= 60) {
    return 'mid';
  }

  return 'low';
}

export function calculateScoreFromRatio(
  numerator: number,
  denominator: number
): number {
  if (denominator <= 0) {
    return 0;
  }

  return calculateAssessmentScore(
    numerator,
    denominator
  );
}
