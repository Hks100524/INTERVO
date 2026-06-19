import { connectDB } from '@/lib/mongodb';
import Session, {
  normalizeSessionData,
  toSessionRecord,
  type SessionData,
} from '@/models/Session';

export async function saveSession(
  topic: string,
  sessionData: SessionData[],
  userId: string
) {
  try {
    console.log('========== SAVE SESSION START ==========');
    console.log('TOPIC:', topic);
    console.log('USER ID:', userId);
    console.log('SESSION DATA LENGTH:', sessionData.length);

    await connectDB();

    const normalizedSessionData =
      normalizeSessionData(sessionData);

    const createdSession = await Session.create({
      userId,
      topic,
      sessionData: normalizedSessionData,
    });

    const savedSession = toSessionRecord(
      createdSession.toObject()
    );

    console.log('SESSION SAVED SUCCESSFULLY');

    return {
      success: true,
      data: [savedSession],
      error: null,
    };

  } catch (error) {
    console.error('Failed to save session:', error);

    return {
      success: false,
      data: null,
      error,
    };
  }
}
