import type {
  AssessmentAnswer,
  AssessmentAnswerValue,
  AssessmentMode,
  AssessmentQuestion,
  AssessmentQuestionType,
  AssessmentStatus,
} from './types';

export const ASSESSMENT_MODES: AssessmentMode[] = [
  'resume',
  'topic',
];

export const ASSESSMENT_STATUSES: AssessmentStatus[] = [
  'draft',
  'generated',
  'submitted',
  'evaluated',
  'failed',
];

export const ASSESSMENT_QUESTION_TYPES: AssessmentQuestionType[] =
  [
    'multiple_choice',
    'short_answer',
    'true_false',
    'scenario',
    'custom',
  ];

export function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function isString(
  value: unknown
): value is string {
  return typeof value === 'string';
}

export function isNonEmptyString(
  value: unknown
): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isOptionalString(
  value: unknown
): value is string | undefined {
  return value === undefined || isString(value);
}

export function isStringArray(
  value: unknown
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string')
  );
}

export function isAssessmentMode(
  value: unknown
): value is AssessmentMode {
  return (
    isString(value) &&
    ASSESSMENT_MODES.includes(value as AssessmentMode)
  );
}

export function isAssessmentStatus(
  value: unknown
): value is AssessmentStatus {
  return (
    isString(value) &&
    ASSESSMENT_STATUSES.includes(value as AssessmentStatus)
  );
}

export function isAssessmentQuestionType(
  value: unknown
): value is AssessmentQuestionType {
  return (
    isString(value) &&
    ASSESSMENT_QUESTION_TYPES.includes(
      value as AssessmentQuestionType
    )
  );
}

export function isAssessmentAnswerValue(
  value: unknown
): value is AssessmentAnswerValue {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    isStringArray(value)
  );
}

export function isAssessmentQuestion(
  value: unknown
): value is AssessmentQuestion {
  if (!isRecord(value)) {
    return false;
  }

  if (!isNonEmptyString(value.question)) {
    return false;
  }

  if (
    value.questionId !== undefined &&
    !isNonEmptyString(value.questionId)
  ) {
    return false;
  }

  if (
    value.type !== undefined &&
    !isAssessmentQuestionType(value.type)
  ) {
    return false;
  }

  if (
    value.options !== undefined &&
    !isStringArray(value.options)
  ) {
    return false;
  }

  if (
    value.correctAnswer !== undefined &&
    !isAssessmentAnswerValue(value.correctAnswer)
  ) {
    return false;
  }

  if (
    value.explanation !== undefined &&
    !isString(value.explanation)
  ) {
    return false;
  }

  if (
    value.tags !== undefined &&
    !isStringArray(value.tags)
  ) {
    return false;
  }

  return true;
}

export function isAssessmentAnswer(
  value: unknown
): value is AssessmentAnswer {
  if (!isRecord(value)) {
    return false;
  }

  if (!isNonEmptyString(value.questionId)) {
    return false;
  }

  if (!isAssessmentAnswerValue(value.answer)) {
    return false;
  }

  if (
    value.feedback !== undefined &&
    !isString(value.feedback)
  ) {
    return false;
  }

  if (
    value.isCorrect !== undefined &&
    typeof value.isCorrect !== 'boolean'
  ) {
    return false;
  }

  if (
    value.score !== undefined &&
    value.score !== null &&
    typeof value.score !== 'number'
  ) {
    return false;
  }

  return true;
}

export function isAssessmentQuestionArray(
  value: unknown
): value is AssessmentQuestion[] {
  return Array.isArray(value) && value.every(isAssessmentQuestion);
}

export function isAssessmentAnswerArray(
  value: unknown
): value is AssessmentAnswer[] {
  return Array.isArray(value) && value.every(isAssessmentAnswer);
}
