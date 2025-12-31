import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
      return NextResponse.json(
        {
          classification: "UNKNOWN",
          risk_score: 0,
          reasons: ["GEMINI_API_KEY missing"],
          recommendation: "Server configuration error.",
        },
        { status: 500 }
      );
    }

    // ✅ OFFICIAL SDK — NO 404, NO ENDPOINT ISSUES
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are a cybersecurity expert.

Return ONLY valid JSON.
NO markdown. NO explanation.

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
    const text = result.response.text();

    if (!text || text.length < 20) {
      throw new Error("Empty Gemini response");
    }

    // ✅ Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON returned by Gemini");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("🔥 Gemini error:", error);

    return NextResponse.json({
      classification: "UNKNOWN",
      risk_score: 0,
      reasons: ["AI analysis failed"],
      recommendation: "Verify manually.",
    });
  }
}
