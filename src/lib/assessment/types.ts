import type { Document, Types } from 'mongoose';

export type AssessmentMode = 'resume' | 'topic';

export type AssessmentStatus =
  | 'draft'
  | 'generated'
  | 'submitted'
  | 'evaluated'
  | 'failed';

export type AssessmentQuestionType =
  | 'multiple_choice'
  | 'short_answer'
  | 'true_false'
  | 'scenario'
  | 'custom';

export type AssessmentAnswerValue =
  | string
  | string[]
  | boolean
  | number
  | null;

export interface AssessmentQuestion {
  questionId?: string;
  question: string;
  type?: AssessmentQuestionType;
  options?: string[];
  correctAnswer?: AssessmentAnswerValue;
  explanation?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface AssessmentAnswer {
  questionId: string;
  answer: AssessmentAnswerValue;
  isCorrect?: boolean;
  score?: number | null;
  feedback?: string;
  metadata?: Record<string, unknown>;
}

export interface AssessmentEvaluation {
  summary?: string;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  recommendations?: string[];
  readinessLevel?: string;
  companyFit?: string;
  scoreBreakdown?: Record<string, number>;
  metadata?: Record<string, unknown>;
}

export interface AssessmentDocument extends Document {
  userId: Types.ObjectId;
  mode: AssessmentMode;
  resumeUrl?: string | null;
  resumeText?: string | null;
  topic?: string | null;
  company: string;
  difficulty: string;
  questions: AssessmentQuestion[];
  answers: AssessmentAnswer[];
  score: number | null;
  evaluation: AssessmentEvaluation | null;
  status: AssessmentStatus;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentCreateInput {
  userId: string | Types.ObjectId;
  mode: AssessmentMode;
  resumeUrl?: string | null;
  resumeText?: string | null;
  topic?: string | null;
  company: string;
  difficulty: string;
}

export interface AssessmentSubmissionInput {
  answers: AssessmentAnswer[];
}

export interface AssessmentAttemptListItem {
  id: string;
  mode: AssessmentMode;
  company: string;
  difficulty: string;
  score: number | null;
  status: AssessmentStatus;
  createdAt: string;
  submittedAt: string | null;
}

export interface AssessmentHistorySummary {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  recentAttempts: number;
}
