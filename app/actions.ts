'use server';

import type {
  UrlAnalysis,
  EmailAnalysis,
  MessageAnalysis,
  AnalysisClassification,
} from '@/app/types';

// Rule-based fallback keywords
const suspiciousKeywords = [
  'login',
  'verify',
  'bank',
  'secure',
  'account',
  'password',
  'update',
  'confirm',
  'urgent',
  'invoice',
  'winner',
  'claim',
];

/* ------------------------------------------------ */
/* 🔗 HELPER: Call Gemini via /api/analyze           */
/* ------------------------------------------------ */

async function callAI(prompt: string): Promise<string> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://safe-click-ai-4uip.vercel.app';

  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt }),
  });

  const data = await res.json();
  return data.reply || data.message || '';
}

/* ------------------------------------------------ */
/* 🌐 URL ANALYSIS                                  */
/* ------------------------------------------------ */

export async function analyzeUrl(input: { url: string }): Promise<UrlAnalysis> {
  try {
    const aiReply = await callAI(
      `Analyze this URL for phishing, scams, or security risks: ${input.url}`
    );

    return {
      url: input.url,
      classification: 'GENUINE',
      risk_score: 10,
      reasons: ['AI-based URL analysis completed successfully.'],
      recommendation: aiReply,
    };
  } catch (error) {
    console.error('URL AI analysis failed, using fallback:', error);

    const url = input.url.toLowerCase();
    let risk_score = 10;
    let classification: AnalysisClassification = 'GENUINE';
    const reasons = ['AI analysis failed. Using rule-based checks.'];

    if (suspiciousKeywords.some((k) => url.includes(k))) {
      risk_score += 40;
      classification = 'SUSPICIOUS';
      reasons.push('URL contains suspicious keywords.');
    }

    if (!url.startsWith('https://')) {
      risk_score += 20;
      classification = 'SUSPICIOUS';
      reasons.push('URL is not using HTTPS.');
    }

    if (risk_score > 70) classification = 'SCAM';

    return {
      url: input.url,
      classification,
      risk_score,
      reasons,
      recommendation:
        'Proceed with caution. This result is based on rule-based checks.',
    };
  }
}

/* ------------------------------------------------ */
/* 📧 EMAIL ANALYSIS                                */
/* ------------------------------------------------ */

export async function analyzeEmail(input: {
  emailContent: string;
}): Promise<EmailAnalysis> {
  try {
    const aiReply = await callAI(
      `Analyze this email for phishing or scam risks:\n\n${input.emailContent}`
    );

    return {
      classification: 'GENUINE',
      risk_score: 15,
      reasons: ['AI-based email analysis completed successfully.'],
      recommendation: aiReply,
    };
  } catch (error) {
    console.error('Email AI analysis failed, using fallback:', error);

    const content = input.emailContent.toLowerCase();
    let risk_score = 15;
    let classification: AnalysisClassification = 'GENUINE';
    const reasons = ['AI analysis failed. Using rule-based checks.'];

    const matches = suspiciousKeywords.filter((k) =>
      content.includes(k)
    );

    if (matches.length) {
      risk_score += matches.length * 15;
      classification = 'SUSPICIOUS';
      reasons.push(`Suspicious keywords found: ${matches.join(', ')}`);
    }

    if (risk_score > 70) classification = 'SCAM';

    return {
      classification,
      risk_score,
      reasons,
      recommendation:
        'Proceed carefully. This email may attempt phishing.',
    };
  }
}

/* ------------------------------------------------ */
/* 💬 MESSAGE ANALYSIS                              */
/* ------------------------------------------------ */

export async function analyzeMessage(input: {
  messageContent: string;
}): Promise<MessageAnalysis> {
  try {
    const aiReply = await callAI(
      `Analyze this message for scam or phishing intent:\n\n${input.messageContent}`
    );

    return {
      classification: 'GENUINE',
      risk_score: 15,
      reasons: ['AI-based message analysis completed successfully.'],
      recommendation: aiReply,
    };
  } catch (error) {
    console.error('Message AI analysis failed, using fallback:', error);

    const msg = input.messageContent.toLowerCase();
    let risk_score = 15;
    let classification: AnalysisClassification = 'GENUINE';
    const reasons = ['AI analysis failed. Using rule-based checks.'];

    if (suspiciousKeywords.some((k) => msg.includes(k))) {
      risk_score += 30;
      classification = 'SUSPICIOUS';
      reasons.push('Suspicious keywords detected.');
    }

    if (risk_score > 70) classification = 'SCAM';

    return {
      classification,
      risk_score,
      reasons,
      recommendation:
        'This message may be unsafe. Verify before responding.',
    };
  }
}

/* ------------------------------------------------ */
/* 🤖 CHATBOT                                      */
/* ------------------------------------------------ */

export async function askQuestion(input: { question: string }) {
  try {
    const reply = await callAI(input.question);
    return { response: reply };
  } catch {
    return {
      response:
        "I'm having trouble responding right now. Please try again later.",
    };
  }
}

/* ------------------------------------------------ */
/* 📰 DAILY BRIEFING                                */
/* ------------------------------------------------ */

export async function getDailyBriefing() {
  return {
    briefing:
      'Daily briefing is temporarily unavailable. Stay alert for phishing links, fake login pages, and suspicious messages.',
  };
}

/* ------------------------------------------------ */
/* 🔊 TEXT TO SPEECH                                */
/* ------------------------------------------------ */

export async function textToSpeech(text: string) {
  return {
    media: null,
  };
}
