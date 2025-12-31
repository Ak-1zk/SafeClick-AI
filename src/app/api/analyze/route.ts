import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const ai = new GoogleGenAI({ apiKey });

    // Use specific Gemini 3 strings for best results
    const model = 'gemini-3-pro-preview';

    const config = {
      thinkingConfig: { thinkingLevel: 'HIGH' },
      systemInstruction: [{ 
        text: "Analyze URL. Return ONLY JSON: {classification, risk_score, reasons, recommendation}" 
      }],
      responseMimeType: "application/json"
    };

    const result = await ai.models.generateContent({
      model: model as any,
      config: config as any,
      contents: [{ role: 'user', parts: [{ text: message }] }],
    });

    // Access text property safely
    const responseText = result.text || "";
    if (!responseText) throw new Error("No text returned from AI");

    return NextResponse.json(JSON.parse(responseText));

  } catch (error: any) {
    console.error("🔥 Error details:", error);
    return NextResponse.json({
      classification: "ERROR",
      reasons: [error.message]
    }, { status: 500 });
  }
}