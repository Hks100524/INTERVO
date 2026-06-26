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

function toISODate(value: Date | null | undefined) {
  return value ? new Date(value).toISOString() : null;
}

function toHistoryItem(assessment: {
  _id: unknown;
  mode: string;
  company: string;
  difficulty: string;
  score: number | null;
  status: string;
  createdAt: Date;
  submittedAt: Date | null;
  topic?: string | null;
}): {
  id: string;
  mode: 'resume' | 'topic';
  company: string;
  difficulty: string;
  score: number | null;
  status: 'draft' | 'generated' | 'submitted' | 'evaluated' | 'failed';
  createdAt: string;
  submittedAt: string | null;
  topic: string | null;
} {
  return {
    id: String(assessment._id),
    mode: assessment.mode as 'resume' | 'topic',
    company: assessment.company,
    difficulty: assessment.difficulty,
    score: assessment.score,
    status: assessment.status as
      | 'draft'
      | 'generated'
      | 'submitted'
      | 'evaluated'
      | 'failed',
    createdAt: assessment.createdAt.toISOString(),
    submittedAt: toISODate(assessment.submittedAt),
    topic: assessment.topic ?? null,
  };
}

function buildSummary(items: Array<{ status: string }>) {
  const totalAttempts = items.length;
  const submittedAttempts = items.filter(
    (item) => item.status === 'submitted'
  ).length;
  const draftAttempts = items.filter(
    (item) => item.status === 'draft'
  ).length;
  const generatedAttempts = items.filter(
    (item) => item.status === 'generated'
  ).length;
  const evaluatedAttempts = items.filter(
    (item) => item.status === 'evaluated'
  ).length;
  const failedAttempts = items.filter(
    (item) => item.status === 'failed'
  ).length;

  return {
    totalAttempts,
    submittedAttempts,
    draftAttempts,
    generatedAttempts,
    evaluatedAttempts,
    failedAttempts,
  };
}

export async function GET() {
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

    await connectDB();

    const assessments = await Assessment.find({
      userId: new Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .exec();

    const history = assessments.map((assessment) =>
      toHistoryItem(assessment.toObject())
    );

    const summary = buildSummary(assessments);

    return NextResponse.json(
      {
        success: true,
        history,
        summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Assessment history API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assessment history',
      },
      { status: 500 }
    );
  }
}
