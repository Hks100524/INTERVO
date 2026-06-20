import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyToken } from '@/lib/jwt';
import { getPastSessions } from '@/lib/db/sessionFetcher';
import { saveSession } from '@/lib/db/sessionSaver';

interface DecodedToken {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function POST(request: Request) {
  try {
    console.log('========== SESSION API HIT ==========');

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    let userId: string;

    try {
      const decoded =
        verifyToken(token) as DecodedToken;
      userId = decoded.userId;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { topic, sessionData } = body;

    console.log('REQUEST BODY:', body);

    if (!topic || !sessionData) {
      console.log('MISSING REQUIRED FIELDS');

      return NextResponse.json(
        {
          error: 'Missing required fields: topic and sessionData',
        },
        { status: 400 }
      );
    }

    console.log('CALLING saveSession()');

    const result = await saveSession(
      topic,
      sessionData,
      userId
    );

    console.log('SAVE RESULT:', result);

    if (!result.success) {
      console.log('DATABASE SAVE FAILED');

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save session in database',
          details: result.error,
        },
        { status: 500 }
      );
    }

    console.log('DATABASE SAVE SUCCESS');

    return NextResponse.json(
      {
        success: true,
        message: 'Session saved successfully',
        data: result.data,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('SESSION API CRASH:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save session',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    let userId: string;

    try {
      const decoded =
        verifyToken(token) as DecodedToken;
      userId = decoded.userId;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const sessions = await getPastSessions(userId);

    return NextResponse.json(
      {
        success: true,
        sessions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('SESSION GET API CRASH:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sessions',
      },
      { status: 500 }
    );
  }
}
