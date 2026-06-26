import type { AssessmentAnswerValue } from './types';

export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function toSafeString(
  value: unknown
): string {
  return typeof value === 'string' ? value : '';
}

export function normalizeWhitespace(
  value: string
): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function stripCodeFences(
  value: string
): string {
  return value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '');
}

export function safeJsonParse(
  value: string
): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function parseStrictJson(
  value: string
): unknown {
  const cleaned = stripCodeFences(value);
  const parsed = safeJsonParse(cleaned);

  if (parsed === null) {
    throw new Error('Invalid JSON response');
  }

  return parsed;
}

export function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  const numericValue =
    typeof value === 'number'
      ? value
      : Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(min, Math.trunc(numericValue))
  );
}

export function uniqueStrings(
  values: string[]
): string[] {
  return Array.from(
    new Set(
      values
        .map((value) =>
          normalizeWhitespace(value)
        )
        .filter(Boolean)
    )
  );
}

export function ensureStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueStrings(
    value.filter((item): item is string =>
      typeof item === 'string'
    )
  );
}

export function normalizeQuestionId(
  index: number,
  questionText?: unknown
): string {
  const slug = normalizeWhitespace(
    toSafeString(questionText)
  )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug
    ? `question-${index + 1}-${slug}`
    : `question-${index + 1}`;
}

export function normalizeAnswerValue(
  value: unknown
): AssessmentAnswerValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return uniqueStrings(
      value.filter((item): item is string =>
        typeof item === 'string'
      )
    );
  }

  return null;
}

export function normalizeDifficulty(
  value: unknown,
  fallback: 'easy' | 'medium' | 'hard' = 'medium'
): 'easy' | 'medium' | 'hard' {
  const normalized = normalizeWhitespace(
    toSafeString(value)
  ).toLowerCase();

  if (
    normalized === 'easy' ||
    normalized === 'medium' ||
    normalized === 'hard'
  ) {
    return normalized;
  }

  return fallback;
}
