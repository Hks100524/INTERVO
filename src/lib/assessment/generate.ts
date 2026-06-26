import type { AssessmentAnswerValue } from './types';
import {
  ensureStringArray,
  isPlainObject,
  normalizeAnswerValue,
  normalizeDifficulty,
  normalizeQuestionId,
  normalizeWhitespace,
  parseStrictJson,
  toSafeString,
} from './helpers';
import {
  buildAssessmentGenerationRequest as buildPromptRequest,
  type AssessmentGenerationRequest,
  type AssessmentPromptInput,
} from './prompt';
import {
  isNonEmptyString,
  isStringArray,
} from './validators';

export type AssessmentGenerationInput =
  AssessmentPromptInput;

export interface AssessmentGeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: AssessmentAnswerValue;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AssessmentGeneratedQuiz {
  assessmentTitle: string;
  company: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: AssessmentGeneratedQuestion[];
}

export interface AssessmentQuizFallback {
  company?: string;
  difficulty?: string;
}

export function buildAssessmentGenerationRequest(
  input: AssessmentGenerationInput
): AssessmentGenerationRequest {
  return buildPromptRequest(input);
}

function normalizeGeneratedQuestion(
  value: Record<string, unknown>,
  index: number,
  fallbackDifficulty: 'easy' | 'medium' | 'hard'
): AssessmentGeneratedQuestion {
  const question = normalizeWhitespace(
    toSafeString(value.question)
  );

  if (!question) {
    throw new Error(
      `Invalid assessment question at index ${index}`
    );
  }

  const options = ensureStringArray(value.options);
  const explanation = normalizeWhitespace(
    toSafeString(value.explanation)
  );
  const category =
    normalizeWhitespace(toSafeString(value.category)) ||
    'General';
  const difficulty = normalizeDifficulty(
    value.difficulty,
    fallbackDifficulty
  );

  return {
    id:
      normalizeWhitespace(toSafeString(value.id)) ||
      normalizeQuestionId(index, question),
    question,
    options,
    correctAnswer: normalizeAnswerValue(
      value.correctAnswer
    ),
    explanation,
    category,
    difficulty,
  };
}

export function normalizeAssessmentQuiz(
  payload: unknown,
  fallback: AssessmentQuizFallback = {}
): AssessmentGeneratedQuiz {
  if (!isPlainObject(payload)) {
    throw new Error('Assessment response must be an object');
  }

  const questions = payload.questions;

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error(
      'Assessment response must include questions'
    );
  }

  const fallbackDifficulty = normalizeDifficulty(
    fallback.difficulty,
    'medium'
  );
  const company = normalizeWhitespace(
    toSafeString(payload.company)
  );
  const assessmentTitle = normalizeWhitespace(
    toSafeString(payload.assessmentTitle)
  );
  const difficulty = normalizeDifficulty(
    payload.difficulty,
    fallbackDifficulty
  );

  if (!assessmentTitle) {
    throw new Error(
      'Assessment response must include assessmentTitle'
    );
  }

  if (!company) {
    const fallbackCompany = normalizeWhitespace(
      toSafeString(fallback.company)
    );

    if (!fallbackCompany) {
      throw new Error(
        'Assessment response must include company'
      );
    }

    return {
      assessmentTitle,
      company: fallbackCompany,
      difficulty,
      questions: questions.map((question, index) =>
        normalizeGeneratedQuestion(
          question as Record<string, unknown>,
          index,
          difficulty
        )
      ),
    };
  }

  return {
    assessmentTitle,
    company,
    difficulty,
    questions: questions.map((question, index) =>
      normalizeGeneratedQuestion(
        question as Record<string, unknown>,
        index,
        difficulty
      )
    ),
  };
}

export function parseAssessmentGenerationResponse(
  rawResponse: string,
  fallback: AssessmentQuizFallback = {}
): AssessmentGeneratedQuiz {
  const parsed = parseStrictJson(rawResponse);
  return normalizeAssessmentQuiz(parsed, fallback);
}

export function isAssessmentGeneratedQuestion(
  value: unknown
): value is AssessmentGeneratedQuestion {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.question) &&
    isStringArray(value.options) &&
    isNonEmptyString(value.explanation) &&
    isNonEmptyString(value.category) &&
    isNonEmptyString(value.difficulty)
  );
}

export function isAssessmentGeneratedQuiz(
  value: unknown
): value is AssessmentGeneratedQuiz {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.assessmentTitle) &&
    isNonEmptyString(value.company) &&
    isNonEmptyString(value.difficulty) &&
    Array.isArray(value.questions) &&
    value.questions.every(
      isAssessmentGeneratedQuestion
    )
  );
}
