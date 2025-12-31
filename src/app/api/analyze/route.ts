import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          classification: "UNKNOWN",
          risk_score: 0,
          reasons: ["No valid input provided"],
          recommendation: "Provide a valid input.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY is missing from environment variables");
      return NextResponse.json(
        {
          classification: "UNKNOWN",
          risk_score: 0,
          reasons: ["Server configuration error"],
          recommendation: "Check API keys.",
        },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
  // Use 'gemini-2.5-flash' (current stable) or 'gemini-3-flash-preview' (latest)
  model: "gemini-2.5-flash", 
  generationConfig: {
    responseMimeType: "application/json",
  },
});

    const prompt = `
      You are a cybersecurity expert analyzing the following input for potential security risks: "${message}"

      Analyze the input and return a JSON object with this exact structure:
      {
        "classification": "SAFE" | "SUSPICIOUS" | "MALICIOUS",
        "risk_score": number (0-100),
        "reasons": ["reason 1", "reason 2"],
        "recommendation": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    // Since we used responseMimeType: "application/json", 
    // we can parse it directly without regex.
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);

  } catch (error: any) {
    // Check if it's a 404/Authentication error
    console.error("🔥 Gemini API Error Detailed:", error);

    return NextResponse.json({
      classification: "ERROR",
      risk_score: 0,
      reasons: [error.message || "AI analysis failed"],
      recommendation: "Please try again later or check API quota.",
    }, { status: 500 });
  }
}
