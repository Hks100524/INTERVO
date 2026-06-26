import mongoose, {
  Model,
  Schema,
} from 'mongoose';

import {
  ASSESSMENT_MODES,
  ASSESSMENT_STATUSES,
} from '@/lib/assessment/validators';

import type {
  AssessmentAnswer,
  AssessmentDocument,
  AssessmentEvaluation,
  AssessmentQuestion,
} from '@/lib/assessment/types';

const AssessmentQuestionSchema = new Schema<AssessmentQuestion>(
  {
    questionId: {
      type: String,
      default: '',
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: 'multiple_choice',
      trim: true,
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      default: null,
    },
    explanation: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: false,
    strict: false,
  }
);

const AssessmentAnswerSchema = new Schema<AssessmentAnswer>(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: Schema.Types.Mixed,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: false,
    strict: false,
  }
);

const AssessmentEvaluationSchema = new Schema<AssessmentEvaluation>(
  {
    summary: {
      type: String,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    readinessLevel: {
      type: String,
      default: '',
    },
    companyFit: {
      type: String,
      default: '',
    },
    scoreBreakdown: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: false,
    strict: false,
  }
);

const AssessmentSchema = new Schema<AssessmentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ASSESSMENT_MODES,
      required: true,
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: null,
      trim: true,
    },
    resumeText: {
      type: String,
      default: null,
    },
    topic: {
      type: String,
      default: null,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      trim: true,
    },
    questions: {
      type: [AssessmentQuestionSchema],
      default: [],
    },
    answers: {
      type: [AssessmentAnswerSchema],
      default: [],
    },
    score: {
      type: Number,
      default: null,
    },
    evaluation: {
      type: AssessmentEvaluationSchema,
      default: null,
    },
    status: {
      type: String,
      enum: ASSESSMENT_STATUSES,
      default: 'draft',
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

AssessmentSchema.index({
  userId: 1,
  createdAt: -1,
});

AssessmentSchema.index({
  userId: 1,
  status: 1,
  createdAt: -1,
});

const Assessment: Model<AssessmentDocument> =
  mongoose.models.Assessment ||
  mongoose.model<AssessmentDocument>(
    'Assessment',
    AssessmentSchema
  );

export default Assessment;
