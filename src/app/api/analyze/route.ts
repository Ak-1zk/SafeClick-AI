import { NextResponse } from "next/server";

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
      return NextResponse.json(
        { error: "Gemini API key missing" },
        { status: 500 }
      );
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const geminiData = await geminiRes.json();

    // 🔍 Robust extraction (handles all Gemini formats)
    let reply =
      geminiData?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        ?.join(" ");

    if (!reply || reply.trim() === "") {
      reply =
        geminiData?.candidates?.[0]?.content?.text ||
        "AI responded, but no readable text was returned.";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "AI processing failed" },
      { status: 500 }
    );
  }
}
