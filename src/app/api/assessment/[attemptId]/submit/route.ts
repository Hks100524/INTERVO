import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';

import Assessment from '@/models/Assessment';
import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import {
  calculateAssessmentAccuracy,
  calculateAssessmentScore,
  getAssessmentReadinessLabel,
} from '@/lib/assessment/score';
import {
  evaluateAssessmentQuiz,
  type AssessmentSubmittedAnswer,
} from '@/lib/assessment/evaluate';
import {
  ensureStringArray,
  normalizeAnswerValue,
  normalizeWhitespace,
  toSafeString,
} from '@/lib/assessment/helpers';
import {
  isAssessmentAnswerArray,
  isRecord,
} from '@/lib/assessment/validators';
import type { AssessmentGeneratedQuiz } from '@/lib/assessment/generate';
import type {
  AssessmentAnswer,
  AssessmentEvaluation,
  AssessmentQuestion,
} from '@/lib/assessment/types';

interface DecodedToken {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

type RouteContext = {
  params: Promise<{
    attemptId: string;
  }>;
};

const VALID_DIFFICULTIES = new Set([
  'easy',
  'medium',
  'hard',
]);

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token) as DecodedToken;

    if (
      !decoded.userId ||
      !Types.ObjectId.isValid(decoded.userId)
    ) {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
}

function normalizeAssessmentDifficulty(
  value: unknown,
  fallback: 'easy' | 'medium' | 'hard' = 'medium'
): 'easy' | 'medium' | 'hard' {
  const normalized = normalizeWhitespace(
    toSafeString(value)
  ).toLowerCase();

  if (VALID_DIFFICULTIES.has(normalized)) {
    return normalized as 'easy' | 'medium' | 'hard';
  }

  return fallback;
}

function toGeneratedQuestion(
  question: AssessmentQuestion,
  index: number,
  fallbackDifficulty: 'easy' | 'medium' | 'hard'
): AssessmentGeneratedQuiz['questions'][number] {
  const questionId =
    normalizeWhitespace(toSafeString(question.questionId)) ||
    `question-${index + 1}`;

  const options = ensureStringArray(question.options);
  const tags = ensureStringArray(question.tags);
  const category =
    tags.length > 0 ? tags[0] : 'General';

  return {
    id: questionId,
    question: normalizeWhitespace(
      toSafeString(question.question)
    ),
    options,
    correctAnswer: normalizeAnswerValue(
      question.correctAnswer
    ),
    explanation: normalizeWhitespace(
      toSafeString(question.explanation)
    ),
    category,
    difficulty: normalizeAssessmentDifficulty(
      question.metadata &&
        typeof question.metadata === 'object' &&
        'difficulty' in question.metadata
        ? (question.metadata as Record<string, unknown>)
            .difficulty
        : fallbackDifficulty,
      fallbackDifficulty
    ),
  };
}

function toGeneratedQuiz(
  assessment: {
    company: string;
    difficulty: string;
    questions: AssessmentQuestion[];
  }
): AssessmentGeneratedQuiz {
  const difficulty = normalizeAssessmentDifficulty(
    assessment.difficulty
  );

  return {
    assessmentTitle: `${assessment.company} Assessment`,
    company: assessment.company,
    difficulty,
    questions: assessment.questions.map((question, index) =>
      toGeneratedQuestion(question, index, difficulty)
    ),
  };
}

function buildEvaluationPayload(
  assessment: {
    company: string;
  },
  evaluationResult: ReturnType<
    typeof evaluateAssessmentQuiz
  >
): AssessmentEvaluation {
  const score = calculateAssessmentScore(
    evaluationResult.summary.correctAnswers,
    evaluationResult.summary.totalQuestions
  );
  const accuracy = calculateAssessmentAccuracy(
    evaluationResult.summary.correctAnswers,
    evaluationResult.summary.answeredQuestions
  );
  const readinessLabel = getAssessmentReadinessLabel(
    score
  );
  const strengths = evaluationResult.items
    .filter((item) => item.isCorrect)
    .map((item) => item.question);
  const improvements = evaluationResult.items
    .filter((item) => !item.isCorrect)
    .map((item) => item.question);

  return {
    summary: `Completed ${evaluationResult.summary.correctAnswers} of ${evaluationResult.summary.totalQuestions} questions correctly.`,
    feedback: `Score ${score}% with ${accuracy}% accuracy.`,
    strengths,
    improvements,
    recommendations: [
      'Review the questions listed in improvements.',
      `Focus on core concepts relevant to ${assessment.company}.`,
      'Retry the assessment after revising missed topics.',
    ],
    readinessLevel: readinessLabel,
    companyFit: assessment.company,
    scoreBreakdown: {
      score,
      accuracy,
      totalQuestions: evaluationResult.summary.totalQuestions,
      answeredQuestions: evaluationResult.summary.answeredQuestions,
      correctAnswers: evaluationResult.summary.correctAnswers,
      incorrectAnswers: evaluationResult.summary.incorrectAnswers,
    },
    metadata: {
      evaluationItems: evaluationResult.items,
    },
  };
}

function toStoredAnswers(
  evaluationResult: ReturnType<
    typeof evaluateAssessmentQuiz
  >
): AssessmentAnswer[] {
  return evaluationResult.items.map((item) => ({
    questionId: item.questionId,
    answer: normalizeAnswerValue(item.submittedAnswer),
    isCorrect: item.isCorrect,
    score: item.score,
    feedback: item.feedback,
    metadata: {
      question: item.question,
      expectedAnswer: item.expectedAnswer,
    },
  }));
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { attemptId } = await context.params;

    if (!Types.ObjectId.isValid(attemptId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid assessment id',
        },
        { status: 400 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
        },
        { status: 400 }
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
        },
        { status: 400 }
      );
    }

    const { answers } = body;

    if (
      !isAssessmentAnswerArray(answers) ||
      answers.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Answers array is required',
        },
        { status: 400 }
      );
    }

    await connectDB();

    const assessment = await Assessment.findOne({
      _id: attemptId,
      userId: new Types.ObjectId(userId),
    });

    if (!assessment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assessment not found',
        },
        { status: 404 }
      );
    }

    if (!assessment.questions.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assessment questions are not ready',
        },
        { status: 409 }
      );
    }

    if (
      ['submitted', 'evaluated', 'completed', 'failed'].includes(
        assessment.status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Assessment has already been submitted.',
        },
        { status: 409 }
      );
    }

    const quiz = toGeneratedQuiz({
      company: assessment.company,
      difficulty: assessment.difficulty,
      questions: assessment.questions,
    });

    const submittedAnswers: AssessmentSubmittedAnswer[] =
      answers.map((answer) => ({
        questionId: answer.questionId,
        answer: normalizeAnswerValue(answer.answer),
      }));

    const evaluationResult = evaluateAssessmentQuiz(
      quiz,
      submittedAnswers
    );
    const score = calculateAssessmentScore(
      evaluationResult.summary.correctAnswers,
      evaluationResult.summary.totalQuestions
    );
    const accuracy = calculateAssessmentAccuracy(
      evaluationResult.summary.correctAnswers,
      evaluationResult.summary.answeredQuestions
    );
    const readinessLabel = getAssessmentReadinessLabel(
      score
    );
    const evaluationPayload = buildEvaluationPayload(
      {
        company: assessment.company,
      },
      evaluationResult
    );
    const storedAnswers = toStoredAnswers(evaluationResult);

    assessment.set({
      answers: storedAnswers,
      score,
      evaluation: evaluationPayload,
      status: 'evaluated',
      submittedAt: new Date(),
    });

    await assessment.save();

    return NextResponse.json(
      {
        success: true,
        assessmentId: assessment._id.toString(),
        status: assessment.status,
        result: {
          items: evaluationResult.items.map((item) => ({
            questionId: item.questionId,
            question: item.question,
            submittedAnswer: item.submittedAnswer,
            isCorrect: item.isCorrect,
            score: item.score,
            feedback: item.feedback,
          })),
          summary: {
            ...evaluationResult.summary,
            score,
            accuracy,
            readinessLabel,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Assessment submit API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit assessment',
      },
      { status: 500 }
    );
  }
}
