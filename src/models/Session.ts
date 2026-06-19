import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from 'mongoose';

export interface SessionData {
  question: string;
  answer: string;
  userAnswer?: string;
  feedback?: string;
  isCorrectEnough?: boolean;
  user_answer?: string;
  ai_feedback?: {
    feedback?: string;
    is_correct_enough?: boolean;
  };
}

export interface SessionRecord {
  id: string;
  user_id: string;
  topic: string;
  session_data: SessionData[];
  created_at: string;
}

interface SessionInputData {
  question?: unknown;
  answer?: unknown;
  userAnswer?: unknown;
  feedback?: unknown;
  isCorrectEnough?: unknown;
  user_answer?: unknown;
  ai_feedback?: {
    feedback?: unknown;
    is_correct_enough?: unknown;
  } | null;
}

export interface SessionDocument extends Document {
  userId: Types.ObjectId;
  topic: string;
  sessionData: SessionData[];
  createdAt: Date;
  updatedAt: Date;
}

function toText(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function toBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : Boolean(value);
}

export function normalizeSessionData(
  sessionData: SessionInputData[] = []
): SessionData[] {
  return sessionData.map((item) => ({
    question: toText(item.question),
    answer: toText(item.answer),
    userAnswer: toText(
      item.userAnswer ?? item.user_answer
    ),
    feedback: toText(
      item.feedback ??
        item.ai_feedback?.feedback
    ),
    isCorrectEnough:
      item.isCorrectEnough !== undefined
        ? toBoolean(item.isCorrectEnough)
        : toBoolean(
            item.ai_feedback?.is_correct_enough
          ),
  }));
}

type SessionLike = {
  _id: { toString(): string } | string;
  userId: { toString(): string } | string;
  topic: string;
  sessionData: SessionInputData[] | SessionData[];
  createdAt: Date | string;
};

export function toSessionRecord(
  session: SessionLike
): SessionRecord {
  return {
    id: session._id.toString(),
    user_id: session.userId.toString(),
    topic: session.topic,
    session_data: normalizeSessionData(
      session.sessionData
    ),
    created_at: new Date(
      session.createdAt
    ).toISOString(),
  };
}

const SessionItemSchema = new Schema<SessionData>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    userAnswer: {
      type: String,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    },
    isCorrectEnough: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const SessionSchema = new Schema<SessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    sessionData: {
      type: [SessionItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

SessionSchema.index({
  userId: 1,
  createdAt: -1,
});

const Session: Model<SessionDocument> =
  mongoose.models.Session ||
  mongoose.model<SessionDocument>(
    'Session',
    SessionSchema
  );

export default Session;
