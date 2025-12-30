'use client';

import { useState } from 'react';
import type { AnyAnalysis, ChatMessage, UrlAnalysis } from '@/app/types';
import { analyzeUrl, analyzeEmail, analyzeMessage } from '@/app/actions';

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
      role: 'model',
      content:
        "I'm Aegis AI, your security assistant. I can analyze URLs, emails, messages, and answer cybersecurity questions.",
    },
  ]);

  const [isBotReplying, setIsBotReplying] = useState(false);

  /* ---------------- URL / EMAIL / MESSAGE ANALYSIS (UNCHANGED) ---------------- */

  const handleAnalyzeUrl = async (urlToAnalyze: string) => {
    setIsLoadingAnalysis(true);
    setAnalysis(null);
    const result = await analyzeUrl({ url: urlToAnalyze });
    setAnalysis(result);
    setIsLoadingAnalysis(false);
  };

  const handleAnalyzeEmail = async (emailContent: string) => {
    setIsLoadingAnalysis(true);
    setAnalysis(null);
    const result = await analyzeEmail({ emailContent });
    setAnalysis(result);
    setIsLoadingAnalysis(false);
  };

  const handleAnalyzeMessage = async (messageContent: string) => {
    setIsLoadingAnalysis(true);
    setAnalysis(null);
    const result = await analyzeMessage({ messageContent });
    setAnalysis(result);
    setIsLoadingAnalysis(false);
  };

  /* ---------------- CHATBOT (FIXED TO USE API ROUTE) ---------------- */

  const handleSendMessage = async (content: string, photoDataUri?: string) => {
    const newUserMessage: ChatMessage = {
      id: `msg-${messageIdCounter++}`,
      role: 'user',
      content,
      photoDataUri,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsBotReplying(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
        }),
      });

      const data = await res.json();

      const botMessage: ChatMessage = {
        id: `msg-${messageIdCounter++}`,
        role: 'model',
        content: data.reply || data.message || 'No response from AI',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${messageIdCounter++}`,
          role: 'model',
          content: '❌ Error contacting SafeClick AI',
        },
      ]);
    } finally {
      setIsBotReplying(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="flex flex-col gap-8">
      <DailyBriefing />

      <Card className="glass-card">
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-0">
          <div className="p-6">
            <Tabs
              defaultValue="url"
              onValueChange={(value) => setCurrentTab(value as AnalysisType)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-background/50 mb-6">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="message">Message</TabsTrigger>
              </TabsList>

              <TabsContent value="url">
                <UrlAnalyzer
                  onAnalyze={handleAnalyzeUrl}
                  isLoading={isLoadingAnalysis}
                />
              </TabsContent>

              <TabsContent value="email">
                <EmailAnalyzer
                  onAnalyze={handleAnalyzeEmail}
                  isLoading={isLoadingAnalysis}
                />
              </TabsContent>

              <TabsContent value="message">
                <MessageAnalyzer
                  onAnalyze={handleAnalyzeMessage}
                  isLoading={isLoadingAnalysis}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="relative p-6">
            <Separator
              orientation="vertical"
              className="absolute left-0 top-0 h-full hidden lg:block"
            />
            <Separator
              orientation="horizontal"
              className="absolute top-0 left-0 w-full lg:hidden"
            />
            <AnalysisResult
              analysis={analysis}
              isLoading={isLoadingAnalysis}
              analysisType={currentTab}
            />
          </div>
        </CardContent>
      </Card>

      <Chatbot
        messages={messages}
        onSendMessage={handleSendMessage}
        isBotReplying={isBotReplying}
      />
    </div>
  );
}
