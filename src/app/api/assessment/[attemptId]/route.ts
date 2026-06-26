import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';

import Assessment from '@/models/Assessment';
import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';

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

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token) as DecodedToken;
    if (!decoded.userId || !Types.ObjectId.isValid(decoded.userId)) {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
}

type SafeAssessmentQuestionResponse = {
  id: string;
  questionId: string;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
};

function toSafeString(value: unknown): string | null {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : null;
}

function sanitizeAssessmentQuestion(
  question: unknown
): SafeAssessmentQuestionResponse {
  const record =
    question && typeof question === 'object'
      ? (question as Record<string, unknown>)
      : {};

  const questionId =
    toSafeString(record.questionId) ??
    toSafeString(record.id) ??
    'question-1';
  const questionText = toSafeString(record.question) ?? '';
  const options = Array.isArray(record.options)
    ? record.options.filter(
        (option): option is string =>
          typeof option === 'string'
      )
    : [];
  const metadata =
    record.metadata && typeof record.metadata === 'object'
      ? (record.metadata as Record<string, unknown>)
      : {};
  const category =
    toSafeString(record.category) ??
    toSafeString(metadata.category) ??
    'General';
  const difficulty =
    toSafeString(record.difficulty) ??
    toSafeString(metadata.difficulty) ??
    'medium';

  return {
    id: questionId,
    questionId,
    question: questionText,
    options,
    category,
    difficulty,
  };
}

function sanitizeAssessmentQuestions(
  questions: unknown[]
): SafeAssessmentQuestionResponse[] {
  return questions.map((question) =>
    sanitizeAssessmentQuestion(question)
  );
}

function sanitizeAssessmentAnswers(answers: unknown[]) {
  return answers.map((answer) => {
    const record =
      answer && typeof answer === 'object'
        ? (answer as Record<string, unknown>)
        : {};

    return {
      questionId: toSafeString(record.questionId) ?? '',
      answer: record.answer ?? null,
    };
  });
}

function sanitizeAssessmentEvaluation(evaluation: unknown) {
  if (!evaluation || typeof evaluation !== 'object') {
    return null;
  }

  const record = evaluation as Record<string, unknown>;
  const scoreBreakdown =
    record.scoreBreakdown && typeof record.scoreBreakdown === 'object'
      ? (record.scoreBreakdown as Record<string, unknown>)
      : null;

  return {
    summary: toSafeString(record.summary),
    feedback: toSafeString(record.feedback),
    strengths: Array.isArray(record.strengths)
      ? record.strengths.filter(
          (value): value is string =>
            typeof value === 'string'
        )
      : [],
    improvements: Array.isArray(record.improvements)
      ? record.improvements.filter(
          (value): value is string =>
            typeof value === 'string'
        )
      : [],
    recommendations: Array.isArray(record.recommendations)
      ? record.recommendations.filter(
          (value): value is string =>
            typeof value === 'string'
        )
      : [],
    readinessLevel: toSafeString(record.readinessLevel),
    companyFit: toSafeString(record.companyFit),
    scoreBreakdown,
  };
}

function serializeAssessment(assessment: {
  _id: unknown;
  userId: unknown;
  mode: string;
  resumeUrl?: string | null;
  resumeText?: string | null;
  topic?: string | null;
  company: string;
  difficulty: string;
  questions: unknown[];
  answers: unknown[];
  score: number | null;
  evaluation: unknown;
  status: string;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: String(assessment._id),
    userId: String(assessment.userId),
    mode: assessment.mode,
    resumeUrl: assessment.resumeUrl ?? null,
    resumeText: assessment.resumeText ?? null,
    topic: assessment.topic ?? null,
    company: assessment.company,
    difficulty: assessment.difficulty,
    questions: sanitizeAssessmentQuestions(
      assessment.questions
    ),
    answers: sanitizeAssessmentAnswers(assessment.answers),
    score: assessment.score,
    evaluation: sanitizeAssessmentEvaluation(
      assessment.evaluation
    ),
    status: assessment.status,
    submittedAt: assessment.submittedAt
      ? assessment.submittedAt.toISOString()
      : null,
    createdAt: assessment.createdAt.toISOString(),
    updatedAt: assessment.updatedAt.toISOString(),
  };
}

export async function GET(
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

    return NextResponse.json(
      {
        success: true,
        assessment: serializeAssessment(
          assessment.toObject()
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Assessment fetch API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assessment',
      },
      { status: 500 }
    );
  }
}
