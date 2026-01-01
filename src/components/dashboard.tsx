'use client';

import { useState } from 'react';
import type { AnyAnalysis, ChatMessage } from '@/app/types';

import UrlAnalyzer from '@/components/url-analyzer';
import EmailAnalyzer from '@/components/email-analyzer';
import MessageAnalyzer from '@/components/message-analyzer';
import AnalysisResult from '@/components/analysis-result';
import Chatbot from '@/components/chatbot';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import DailyBriefing from './daily-briefing';

let messageIdCounter = 0;
type AnalysisType = 'url' | 'email' | 'message';

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<AnyAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [currentTab, setCurrentTab] = useState<AnalysisType>('url');

  const [messages, setMessages] = useState<ChatMessage[]>([
  {
    id: `msg-${messageIdCounter++}`,
    role: "assistant",
    content:
      "I'm Aegis AI, your security assistant. I can analyze URLs, emails, messages, and answer cybersecurity questions.",
  },
]);


  const [isBotReplying, setIsBotReplying] = useState(false);

  /* ---------- API CALL ---------- */

  const analyzeViaAPI = async (text: string): Promise<AnyAnalysis> => {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || 'Analysis failed');
    }

    return data;
  };

  /* ---------- URL / EMAIL / MESSAGE ---------- */

  const handleAnalyzeUrl = async (url: string) => {
    try {
      setIsLoadingAnalysis(true);
      setAnalysis(null);
      setAnalysis(await analyzeViaAPI(url));
    } catch {
      setAnalysis({
        classification: 'SUSPICIOUS',
        risk_score: 100,
        reasons: ['Failed to analyze URL'],
        recommendation: 'Please try again later.',
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleAnalyzeEmail = async (email: string) => {
    try {
      setIsLoadingAnalysis(true);
      setAnalysis(null);
      setAnalysis(await analyzeViaAPI(email));
    } catch {
      setAnalysis({
        classification: 'SUSPICIOUS',
        risk_score: 100,
        reasons: ['Failed to analyze email'],
        recommendation: 'Please try again later.',
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleAnalyzeMessage = async (message: string) => {
    try {
      setIsLoadingAnalysis(true);
      setAnalysis(null);
      setAnalysis(await analyzeViaAPI(message));
    } catch {
      setAnalysis({
        classification: 'SUSPICIOUS',
        risk_score: 100,
        reasons: ['Failed to analyze message'],
        recommendation: 'Please try again later.',
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  /* ---------- CHAT ---------- */

  const handleSendMessage = async (content: string, photoDataUri?: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${messageIdCounter++}`,
      role: 'user',
      content,
      photoDataUri,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsBotReplying(true);

    try {
      const result = await analyzeViaAPI(content);
      setMessages((prev) => [
  ...prev,
  {
    id: `msg-${messageIdCounter++}`,
    role: "assistant",
    content: result.recommendation || "Analysis completed.",
  },
]);
      setMessages((prev) => [
  ...prev,
  {
    id: `msg-${messageIdCounter++}`,
    role: "assistant",
    content: "❌ Error contacting SafeClick AI",
  },
]);
    } finally {
      setIsBotReplying(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <div className="flex flex-col gap-8">
      <DailyBriefing />

      <Card className="glass-card">
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-0">
          <div className="p-6">
            <Tabs
              defaultValue="url"
              onValueChange={(v) => setCurrentTab(v as AnalysisType)}
            >
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="message">Message</TabsTrigger>
              </TabsList>

              <TabsContent value="url">
                <UrlAnalyzer onAnalyze={handleAnalyzeUrl} isLoading={isLoadingAnalysis} />
              </TabsContent>

              <TabsContent value="email">
                <EmailAnalyzer onAnalyze={handleAnalyzeEmail} isLoading={isLoadingAnalysis} />
              </TabsContent>

              <TabsContent value="message">
                <MessageAnalyzer onAnalyze={handleAnalyzeMessage} isLoading={isLoadingAnalysis} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="relative p-6">
            <Separator orientation="vertical" className="absolute left-0 top-0 h-full hidden lg:block" />
            <Separator orientation="horizontal" className="absolute top-0 left-0 w-full lg:hidden" />
            <AnalysisResult analysis={analysis} isLoading={isLoadingAnalysis} analysisType={currentTab} />
          </div>
        </CardContent>
      </Card>

      <Chatbot messages={messages} onSendMessage={handleSendMessage} isBotReplying={isBotReplying} />
    </div>
  );
}
