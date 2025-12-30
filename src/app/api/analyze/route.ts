import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Gemini SDK requires Node.js runtime
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
          recommendation: "Provide a valid input for analysis.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY missing");
      return NextResponse.json(
        {
          classification: "UNKNOWN",
          risk_score: 0,
          reasons: ["AI service not configured"],
          recommendation: "Try again later.",
        },
        { status: 500 }
      );
    }

    // ✅ FREE-TIER SAFE MODEL
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are a cybersecurity expert.

Return ONLY valid JSON.
DO NOT include markdown or explanations.

FORMAT:
{
  "classification": "SAFE | SUSPICIOUS | MALICIOUS",
  "risk_score": number (0-100),
  "reasons": string[],
  "recommendation": string
}

INPUT:
${message}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // ✅ SAFE JSON EXTRACTION
    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("❌ Invalid Gemini JSON:", text);
      throw err;
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("🔥 Gemini error:", error);

    // ✅ FREE-TIER RATE LIMIT HANDLING
    if (error?.status === 429) {
      return NextResponse.json({
        classification: "UNKNOWN",
        risk_score: 0,
        reasons: ["AI analysis temporarily unavailable (free-tier limit reached)"],
        recommendation:
          "Please try again later. This does not mean the content is unsafe.",
      });
    }

    // 🔒 GENERAL FAILSAFE
    return NextResponse.json({
      classification: "UNKNOWN",
      risk_score: 0,
      reasons: ["AI analysis failed"],
      recommendation: "Unable to analyze right now. Verify manually.",
    });
  }
}

