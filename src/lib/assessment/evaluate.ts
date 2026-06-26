import type { AssessmentAnswerValue } from './types';
import {
  normalizeAnswerValue,
  normalizeWhitespace,
  uniqueStrings,
} from './helpers';
import {
  calculateAssessmentAccuracy,
  calculateAssessmentScore,
  getAssessmentReadinessLabel,
} from './score';
import type {
  AssessmentGeneratedQuestion,
  AssessmentGeneratedQuiz,
} from './generate';

export interface AssessmentSubmittedAnswer {
  questionId: string;
  answer: AssessmentAnswerValue;
}

export interface AssessmentEvaluationItem {
  questionId: string;
  question: string;
  expectedAnswer: AssessmentAnswerValue;
  submittedAnswer: AssessmentAnswerValue;
  isCorrect: boolean;
  score: number;
  feedback: string;
}

export interface AssessmentEvaluationSummary {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  accuracy: number;
  readinessLabel: string;
}

export interface AssessmentEvaluationResult {
  items: AssessmentEvaluationItem[];
  summary: AssessmentEvaluationSummary;
}

function normalizeComparableText(
  value: string
): string {
  return normalizeWhitespace(value).toLowerCase();
}

function areStringArraysEqual(
  left: string[],
  right: string[]
): boolean {
  const normalizedLeft = uniqueStrings(left).sort();
  const normalizedRight = uniqueStrings(right).sort();

  if (
    normalizedLeft.length !== normalizedRight.length
  ) {
    return false;
  }

  return normalizedLeft.every(
    (item, index) =>
      item === normalizedRight[index]
  );
}

export function compareAssessmentAnswers(
  expected: AssessmentAnswerValue,
  submitted: AssessmentAnswerValue
): boolean {
  const normalizedExpected =
    normalizeAnswerValue(expected);
  const normalizedSubmitted =
    normalizeAnswerValue(submitted);

  if (
    Array.isArray(normalizedExpected) ||
    Array.isArray(normalizedSubmitted)
  ) {
    if (
      !Array.isArray(normalizedExpected) ||
      !Array.isArray(normalizedSubmitted)
    ) {
      return false;
    }

    return areStringArraysEqual(
      normalizedExpected,
      normalizedSubmitted
    );
  }

  if (
    typeof normalizedExpected === 'string' &&
    typeof normalizedSubmitted === 'string'
  ) {
    return (
      normalizeComparableText(normalizedExpected) ===
      normalizeComparableText(normalizedSubmitted)
    );
  }

  return normalizedExpected === normalizedSubmitted;
}

export function evaluateAssessmentQuestion(
  question: AssessmentGeneratedQuestion,
  submittedAnswer: AssessmentAnswerValue
): AssessmentEvaluationItem {
  const isCorrect = compareAssessmentAnswers(
    question.correctAnswer,
    submittedAnswer
  );

  return {
    questionId: question.id,
    question: question.question,
    expectedAnswer: question.correctAnswer,
    submittedAnswer: normalizeAnswerValue(
      submittedAnswer
    ),
    isCorrect,
    score: isCorrect ? 1 : 0,
    feedback: isCorrect
      ? 'Correct'
      : 'Review this answer later',
  };
}

export function mapSubmittedAnswersByQuestionId(
  answers: AssessmentSubmittedAnswer[]
): Map<string, AssessmentAnswerValue> {
  return new Map(
    answers.map((answer) => [
      answer.questionId,
      normalizeAnswerValue(answer.answer),
    ])
  );
}

export function evaluateAssessmentQuiz(
  quiz: AssessmentGeneratedQuiz,
  submittedAnswers: AssessmentSubmittedAnswer[]
): AssessmentEvaluationResult {
  const answersByQuestionId =
    mapSubmittedAnswersByQuestionId(submittedAnswers);

  const items = quiz.questions.map((question) =>
    evaluateAssessmentQuestion(
      question,
      answersByQuestionId.get(question.id) ?? null
    )
  );

  const totalQuestions = items.length;
  const answeredQuestions = items.filter((item) =>
    item.submittedAnswer !== null &&
    item.submittedAnswer !== undefined &&
    !(
      typeof item.submittedAnswer === 'string' &&
      item.submittedAnswer.trim() === ''
    )
  ).length;
  const correctAnswers = items.filter(
    (item) => item.isCorrect
  ).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const score = calculateAssessmentScore(
    correctAnswers,
    totalQuestions
  );
  const accuracy = calculateAssessmentAccuracy(
    correctAnswers,
    answeredQuestions
  );

  return {
    items,
    summary: {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      score,
      accuracy,
      readinessLabel:
        getAssessmentReadinessLabel(score),
    },
  };
}

export function buildEvaluationPreview(
  quiz: AssessmentGeneratedQuiz,
  submittedAnswers: AssessmentSubmittedAnswer[]
) {
  return evaluateAssessmentQuiz(
    quiz,
    submittedAnswers
  );
}
