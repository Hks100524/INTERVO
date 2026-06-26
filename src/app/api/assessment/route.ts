import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';

import Assessment from '@/models/Assessment';
import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { buildAssessmentGenerationRequest } from '@/lib/assessment/prompt';
import {
  parseAssessmentGenerationResponse,
  type AssessmentGeneratedQuiz,
} from '@/lib/assessment/generate';
import {
  clampNumber,
  normalizeWhitespace,
  toSafeString,
} from '@/lib/assessment/helpers';
import {
  isAssessmentMode,
  isNonEmptyString,
  isRecord,
} from '@/lib/assessment/validators';
import type { AssessmentQuestion } from '@/lib/assessment/types';

interface DecodedToken {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

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
  value: unknown
): 'easy' | 'medium' | 'hard' | null {
  const normalized = normalizeWhitespace(
    toSafeString(value)
  ).toLowerCase();

  if (VALID_DIFFICULTIES.has(normalized)) {
    return normalized as 'easy' | 'medium' | 'hard';
  }

  return null;
}

function toAssessmentQuestion(
  question: AssessmentGeneratedQuiz['questions'][number]
): AssessmentQuestion {
  return {
    questionId: question.id,
    question: question.question,
    type:
      question.options.length > 0
        ? 'multiple_choice'
        : 'custom',
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    tags: [question.category],
    metadata: {
      category: question.category,
      difficulty: question.difficulty,
      source: 'gemini',
    },
  };
}

type SafeAssessmentQuestionResponse = {
  id: string;
  questionId: string;
  question: string;
  options: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

function toSafeQuestionResponse(
  question: AssessmentGeneratedQuiz['questions'][number]
): SafeAssessmentQuestionResponse {
  return {
    id: question.id,
    questionId: question.id,
    question: question.question,
    options: question.options,
    category: question.category,
    difficulty: question.difficulty,
  };
}

function toSafeQuizResponse(
  quiz: AssessmentGeneratedQuiz
) {
  return {
    ...quiz,
    questions: quiz.questions.map((question) =>
      toSafeQuestionResponse(question)
    ),
  };
}

function toStoredQuestions(
  quiz: AssessmentGeneratedQuiz
): AssessmentQuestion[] {
  return quiz.questions.map((question) =>
    toAssessmentQuestion(question)
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
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

    const { mode, resumeUrl, resumeText, topic } = body;
    const company = normalizeWhitespace(
      toSafeString(body.company)
    );
    const difficulty = normalizeAssessmentDifficulty(
      body.difficulty
    );
    const questionCount = clampNumber(
      body.questionCount,
      1,
      20,
      5
    );

    if (!isAssessmentMode(mode)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid assessment mode',
        },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(company)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company is required',
        },
        { status: 400 }
      );
    }

    if (!difficulty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Difficulty is required',
        },
        { status: 400 }
      );
    }

    const normalizedResumeText = normalizeWhitespace(
      toSafeString(resumeText)
    );
    const normalizedResumeUrl = normalizeWhitespace(
      toSafeString(resumeUrl)
    );
    const normalizedTopic = normalizeWhitespace(
      toSafeString(topic)
    );

    if (mode === 'resume' && !normalizedResumeText) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resume text is required for resume mode',
        },
        { status: 400 }
      );
    }

    if (mode === 'topic' && !normalizedTopic) {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic is required for topic mode',
        },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini configuration is missing',
        },
        { status: 503 }
      );
    }

    const generationRequest =
      buildAssessmentGenerationRequest({
        mode,
        resumeText:
          mode === 'resume'
            ? normalizedResumeText
            : undefined,
        topic:
          mode === 'topic'
            ? normalizedTopic
            : undefined,
        company,
        difficulty,
        questionCount,
      });

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );
    const model = genAI.getGenerativeModel({
      model: generationRequest.model,
      systemInstruction:
        generationRequest.systemInstruction,
    });

    const MAX_RETRIES = 3;
    let rawResponse: string | null = null;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
      try {
        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: generationRequest.prompt,
                },
              ],
            },
          ],
          generationConfig:
            generationRequest.generationConfig,
        });
        const response = await result.response;
        rawResponse = response.text();

        if (rawResponse) {
          lastError = null;
          break;
        }
      } catch (error) {
        lastError = error;

        if (attempt < MAX_RETRIES - 1) {
          const delay = Math.random() * 1000 + 1000;
          await sleep(delay);
        } else {
          throw error;
        }
      }
    }

    if (!rawResponse) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini returned an empty response',
        },
        { status: 502 }
      );
    }

    let quiz: AssessmentGeneratedQuiz;

    try {
      quiz = parseAssessmentGenerationResponse(
        rawResponse,
        {
          company,
          difficulty,
        }
      );
    } catch (error) {
      console.error(
        'Assessment generation parse error:',
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            'Gemini returned invalid JSON for assessment generation',
        },
        { status: 502 }
      );
    }

    await connectDB();

    const assessment = await Assessment.create({
      userId: new Types.ObjectId(userId),
      mode,
      resumeUrl:
        mode === 'resume' && normalizedResumeUrl
          ? normalizedResumeUrl
          : null,
      resumeText:
        mode === 'resume'
          ? normalizedResumeText
          : null,
      topic:
        mode === 'topic' ? normalizedTopic : null,
      company,
      difficulty,
      questions: toStoredQuestions(quiz),
      answers: [],
      score: null,
      evaluation: null,
      status: 'generated',
      submittedAt: null,
    });

    return NextResponse.json(
      {
        success: true,
        assessmentId: assessment._id.toString(),
        status: assessment.status,
        quiz: toSafeQuizResponse(quiz),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Assessment generation API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate assessment',
      },
      { status: 500 }
    );
  }
}
