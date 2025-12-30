'use server';

import type {
  UrlAnalysis,
  EmailAnalysis,
  MessageAnalysis,
  AnalysisClassification,
} from '@/app/types';

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

  if (typeof data?.reply === 'string') return data.reply;
  if (typeof data?.message === 'string') return data.message;
  return '';
}

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
    const url = input.url.toLowerCase();
    let risk_score = 10;
    let classification: AnalysisClassification = 'GENUINE';
    const reasons = ['AI analysis failed. Using rule-based checks.'];

    if (suspiciousKeywords.some(k => url.includes(k))) {
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
  } catch {
    return {
      classification: 'SUSPICIOUS',
      risk_score: 50,
      reasons: ['AI analysis failed. Using fallback checks.'],
      recommendation:
        'Proceed carefully. This email may attempt phishing.',
    };
  }
}

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
  } catch {
    return {
      classification: 'SUSPICIOUS',
      risk_score: 50,
      reasons: ['AI analysis failed. Using fallback checks.'],
      recommendation:
        'This message may be unsafe. Verify before responding.',
    };
  }
}

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

export async function getDailyBriefing() {
  return {
    briefing:
      'Daily briefing is temporarily unavailable. Stay alert for phishing links, fake login pages, and suspicious messages.',
  };
}

export async function textToSpeech(_text: string) {
  return { media: null };
}
