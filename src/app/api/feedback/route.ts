import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

const USE_DEMO_MODE = false;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  let requestBody: any = {};

  try {
    requestBody = await request.json();

    const { question, correctAnswer, userAnswer } = requestBody;

    console.log("========== FEEDBACK API HIT ==========");
    console.log("QUESTION:", question);
    console.log("USER ANSWER:", userAnswer);

    if (!question || !correctAnswer || !userAnswer) {
      return NextResponse.json(
        {
          error:
            "Missing required fields (question, correctAnswer, userAnswer)",
        },
        { status: 400 }
      );
    }

    if (USE_DEMO_MODE || !process.env.GEMINI_API_KEY) {
      console.log("Using Demo Feedback");

      const isCorrect = userAnswer.trim().length > 20;

      return NextResponse.json({
        feedback: isCorrect
          ? "Good attempt! Your answer covers the main concepts."
          : "Your answer is too short. Add more details.",
        is_correct_enough: isCorrect,
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an expert technical interviewer.

Question:
${question}

Correct Answer:
${correctAnswer}

User Answer:
${userAnswer}

Evaluate the user's answer.

Return ONLY valid JSON.

{
  "is_correct_enough": true,
  "feedback": "feedback text"
}

OR

{
  "is_correct_enough": false,
  "feedback": "feedback text"
}
`;

    const MAX_RETRIES = 3;

    let feedbackText: string | null = null;
    let lastError: any = null;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        console.log(`Gemini Attempt ${i + 1}`);

        const result = await model.generateContent(prompt);

        const response = await result.response;

        feedbackText = response.text();

        console.log("RAW GEMINI RESPONSE:");
        console.log(feedbackText);

        if (feedbackText) {
          break;
        }
      } catch (err: any) {
        console.error("Gemini Error:", err);

        lastError = err;

        if (
          err.message?.includes("503") &&
          i < MAX_RETRIES - 1
        ) {
          await sleep(2000);
          continue;
        }

        throw err;
      }
    }

    if (!feedbackText) {
      throw lastError || new Error("No response from Gemini");
    }

    try {
      let cleanedText = feedbackText.trim();

      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
      }

      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText
          .replace(/```/g, "")
          .trim();
      }

      console.log("CLEANED RESPONSE:");
      console.log(cleanedText);

      const parsed = JSON.parse(cleanedText);

      console.log("PARSED RESPONSE:");
      console.log(parsed);

      return NextResponse.json({
        feedback: parsed.feedback,
        is_correct_enough: parsed.is_correct_enough,
      });
    } catch (parseError) {
      console.error("JSON Parse Failed:", parseError);

      return NextResponse.json({
        feedback: feedbackText,
        is_correct_enough: null,
      });
    }
  } catch (error: any) {
    console.error("========== FEEDBACK API ERROR ==========");
    console.error(error);

    const userAnswer = requestBody?.userAnswer || "";

    const isCorrect = userAnswer.trim().length > 20;

    return NextResponse.json({
      feedback: isCorrect
        ? "Good attempt! Your answer covers several important concepts. Try adding more technical depth and examples."
        : "Your answer is too brief. Expand your explanation and include the main concepts.",
      is_correct_enough: isCorrect,
    });
  }
}