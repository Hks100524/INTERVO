import { NextResponse } from 'next/server';
import { saveSession } from '@/lib/db/sessionSaver';

export async function POST(request: Request) {
  try {
    console.log('========== SESSION API HIT ==========');

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

    const userId = 'temp-user-id';

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

  } catch (error: any) {
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