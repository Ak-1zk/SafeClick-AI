import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY missing");
    }

    const ai = new GoogleGenAI({ apiKey });

    // ✅ Free + stable model (recommended)
    const model = "gemini-3-flash-preview"; // Or "gemini-3-pro-preview"

    const result = await ai.models.generateContent({
      model: modelId,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: "LOW" }, // HIGH may cause quota issues
        systemInstruction: [
          {
            text:
              "Analyze the URL or text. Return ONLY valid JSON in this format: " +
              "{ classification, risk_score, reasons, recommendation }"
          }
        ]
      } as any,
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ]
    });

    const responseText = result.text;
    if (!responseText) {
      throw new Error("No response text returned from Gemini");
    }

    return NextResponse.json(JSON.parse(responseText));

  } catch (error: any) {
    console.error("🔥 Analyze API Error:", error);

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Daily limit reached. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        classification: "ERROR",
        reasons: [error.message || "Internal server error"]
      },
      { status: 500 }
    );
  }
}
