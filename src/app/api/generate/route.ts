import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDemoQuestions } from "@/lib/demoQuestions";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);
// Disable demo mode - always use real API
const USE_DEMO_MODE = false;

function cleanGeminiResponse(text: string): string {
  const cleaned = text
    .replace(/^```json\n?/, "")
    .replace(/```$/, "");
  return cleaned.trim();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  let topic = 'javascript'; // default fallback topic
  
  try {
    const body = await request.json();
    topic = body.topic || topic;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    
    // Use demo mode if enabled or API key is missing
    if (USE_DEMO_MODE || !process.env.GEMINI_API_KEY) {
      console.log('Using demo mode for topic:', topic);
      const demoData = getDemoQuestions(topic);
      return NextResponse.json(demoData, { status: 200 });
    }
    
    console.log('Generating questions for topic:', topic);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert ${topic} interviewer.
      Generate 10 technical interview questions related to ${topic}.
      For each question, provide a concise, accurate answer.
      IMPORTANT: Return the response *only* as a valid JSON array of objects.
      Do NOT include any other text, explanation, or markdown formatting (like \`\`\`json).
      Example format: [{"question": "...", "answer": "..."}]
    `;

    const MAX_RETRIES = 3;
    let aiResponseText: string | null = null;
    let lastError: any = null;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        console.log(`Attempt ${i + 1}/${MAX_RETRIES} to generate questions for topic: ${topic}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiResponseText = response.text();
        
        if (aiResponseText) {
          console.log(`Successfully received AI response on attempt ${i + 1}`);
          lastError = null;
          break;
        }
      } catch (error: any) {
        console.error(`Attempt ${i + 1} failed:`, error.message);
        lastError = error;
        if (error.message && error.message.includes("503") && i < MAX_RETRIES - 1) {
          const delay = Math.random() * 1000 + 1000;
          console.log(`Retrying after ${Math.round(delay)}ms delay...`);
          await sleep(delay);
        } else {
          throw error;
        }
      }
    }

    if (aiResponseText) {
      console.log('Raw AI response (first 200 chars):', aiResponseText.substring(0, 200));
      const cleanedText = cleanGeminiResponse(aiResponseText);
      console.log('Cleaned text (first 200 chars):', cleanedText.substring(0, 200));
      
      try {
        const jsonData = JSON.parse(cleanedText);
        console.log('Successfully parsed JSON, question count:', jsonData.length);
        return NextResponse.json(jsonData, { status: 200 });
      } catch (parseError: any) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.error('Parse error details:', {
          message: parseError.message,
          cleanedText: cleanedText.substring(0, 500)
        });
        throw parseError;
      }
    } else {
      throw lastError || new Error("AI (Gemini) did not return content after all retries.");
    }

  } catch (error: any) {
    console.error('Error in generate API:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      name: error.name
    });
    
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    );
  }
}
