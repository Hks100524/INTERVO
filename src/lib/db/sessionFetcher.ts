import { Types } from 'mongoose';

import { connectDB } from '@/lib/mongodb';
import Session, {
  toSessionRecord,
  type SessionRecord,
} from '@/models/Session';

export type InterviewSession = SessionRecord;

export async function getPastSessions(
  userId: string
): Promise<InterviewSession[]> {

  try {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }

    await connectDB();

    const sessions = await Session.find({
      userId: new Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 });

    return sessions.map((session) =>
      toSessionRecord(session.toObject())
    );

  } catch (error) {

    console.error('Failed to fetch sessions:', error);

    return [];
  }
}
