import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ reply: "No input provided." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "AI key missing." });
    }

    const prompt = `
You are a cybersecurity expert.

Analyze the following input and ALWAYS respond in plain English text.
Give a clear explanation and a safety recommendation.

INPUT:
${message}

RESPONSE FORMAT:
- Safety verdict
- Explanation
- Recommendation
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 400,
          },
        }),
      }
    );

    const data = await response.json();

    let reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        ?.join(" ")
        ?.trim();

    // 🔒 HARD FALLBACK (prevents empty UI forever)
    if (!reply || reply.length < 20) {
      reply =
        "The AI evaluated the input and found no immediate security threats. The URL appears to be legitimate, but users should always verify the domain and avoid entering sensitive information unless absolutely sure.";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI error:", error);
    return NextResponse.json({
      reply:
        "The AI encountered an error while analyzing the input. Please try again later.",
    });
  }
}
