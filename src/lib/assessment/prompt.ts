import type { AssessmentMode } from './types';
import {
  clampNumber,
  normalizeWhitespace,
  toSafeString,
} from './helpers';

export interface AssessmentPromptInput {
  mode: AssessmentMode;
  resumeText?: string;
  topic?: string;
  company: string;
  difficulty: string;
  questionCount: number;
}

export interface AssessmentGenerationRequest {
  model: string;
  systemInstruction: string;
  prompt: string;
  generationConfig: {
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
    responseMimeType: 'application/json';
  };
}

export const ASSESSMENT_GEMINI_MODEL =
  'gemini-2.5-flash';

function buildSchemaBlock() {
  return `{
  "assessmentTitle": "string",
  "company": "string",
  "difficulty": "easy | medium | hard",
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": ["string"],
      "correctAnswer": "string | number | boolean | string[] | null",
      "explanation": "string",
      "category": "string",
      "difficulty": "easy | medium | hard"
    }
  ]
}`;
}

export function buildAssessmentSystemPrompt() {
  return [
    'You are an expert assessment generator for INTERVO.',
    'Create a company-standard technical assessment that feels realistic, concise, and highly structured.',
    'The output must be valid JSON only.',
    'Do not include markdown, code fences, commentary, or any extra text.',
    'Do not explain your reasoning.',
    'Do not include trailing commas.',
    'Every question should be suitable for interview-readiness evaluation.',
  ].join(' ');
}

export function buildAssessmentPrompt(
  input: AssessmentPromptInput
) {
  const questionCount = clampNumber(
    input.questionCount,
    1,
    20,
    5
  );

  const modeSection =
    input.mode === 'resume'
      ? `RESUME TEXT:
${normalizeWhitespace(toSafeString(input.resumeText)) || 'N/A'}`
      : `TOPIC:
${normalizeWhitespace(toSafeString(input.topic)) || 'N/A'}`;

  return `
Generate a company-standard technical assessment for INTERVO.

MODE:
${input.mode}

TARGET COMPANY:
${normalizeWhitespace(input.company)}

DIFFICULTY:
${normalizeWhitespace(input.difficulty)}

NUMBER OF QUESTIONS:
${questionCount}

INPUT CONTEXT:
${modeSection}

RESPONSE RULES:
- Return strict JSON only.
- Do not wrap the response in markdown.
- Do not include any explanatory text.
- Use the exact schema below.
- Keep questions focused on interview readiness.
- Match the company and difficulty.
- Ensure the assessment feels realistic and production-ready.
- Provide one assessmentTitle for the full quiz.

SCHEMA:
${buildSchemaBlock()}

JSON ONLY.
`.trim();
}

export function buildAssessmentGenerationRequest(
  input: AssessmentPromptInput
): AssessmentGenerationRequest {
  return {
    model: ASSESSMENT_GEMINI_MODEL,
    systemInstruction: buildAssessmentSystemPrompt(),
    prompt: buildAssessmentPrompt(input),
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };
}
