import { NextResponse } from "next/server";

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

    // ✅ STABLE GEMINI MODEL (NO 404, WORKS ON VERCEL)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
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
`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json({
          classification: "UNKNOWN",
          risk_score: 0,
          reasons: ["Free-tier limit reached"],
          recommendation: "Please try again later.",
        });
      }

      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      throw new Error("Empty Gemini response");
    }

    // ✅ SAFE JSON EXTRACTION
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

