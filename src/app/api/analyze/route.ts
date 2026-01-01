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
      console.error("❌ GEMINI_API_KEY is missing from environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Initialize the new SDK
    const ai = new GoogleGenAI({ apiKey });

    /**
     * ✅ OPTION A: Using Gemini 3 (Supports thinkingLevel)
     * Use "gemini-3-flash-preview" or "gemini-3-pro-preview"
     */
    const activeModel = "gemini-3-flash-preview";

    const result = await ai.models.generateContent({
      model: activeModel, // Fixed: variable name must match the model string
      config: {
        responseMimeType: "application/json",
        // thinkingLevel is ONLY for gemini-3 models
        thinkingConfig: { thinkingLevel: "LOW" }, 
        systemInstruction: [
          {
            text:
              "You are a cybersecurity expert. Analyze the URL or text for risks. " +
              "Return ONLY valid JSON in this format: " +
              "{ \"classification\": \"string\", \"risk_score\": number, \"reasons\": [], \"recommendation\": \"string\" }"
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

    // Extract text from the new SDK response structure
    const responseText = result.text;
    
    if (!responseText) {
      throw new Error("Gemini returned an empty response.");
    }

    // Clean text in case of markdown artifacts and parse
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("🔥 Analyze API Error:", error);

    // Specific handling for common API errors
    const statusCode = error?.status || 500;
    
    if (statusCode === 429) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    if (statusCode === 400 && error.message.includes("Thinking level")) {
      return NextResponse.json(
        { error: "Model configuration mismatch. Please check thinkingLevel support." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        classification: "ERROR",
        reasons: [error.message || "An unexpected error occurred during analysis."]
      },
      { status: statusCode }
    );
  }
}
