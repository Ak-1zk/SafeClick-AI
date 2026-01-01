'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, Newspaper } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/* ---------------- Markdown Renderer ---------------- */

const Markdown = ({ content }: { content: string }) => {
  const html = content
    .replace(
      /### (.*)/g,
      '<h3 class="text-md font-semibold font-headline text-primary mb-2 mt-4">$1</h3>'
    )
    .replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="font-semibold text-foreground/90">$1</strong>'
    )
    .replace(/---/g, '<hr class="my-4 border-white/10" />');

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="prose prose-invert text-sm text-muted-foreground leading-relaxed"
    />
  );
};

/* ---------------- Component ---------------- */

export default function DailyBriefing() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchBriefing = async () => {
    if (briefing || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:
            'Give a short daily cybersecurity threat briefing with 2–3 points.',
        }),
      });

      const data = await res.json();

      setBriefing(
        data.recommendation ||
          'Stay alert today and avoid suspicious links and messages.'
      );
    } catch {
      setBriefing(
        'Unable to fetch the daily briefing at the moment. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Newspaper className="h-6 w-6 text-primary" />
          SafeClick AI Daily Briefing
        </CardTitle>
        <CardDescription>
          Get your daily summary of the latest cybersecurity threats.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          onValueChange={handleFetchBriefing}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger disabled={isLoading}>
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-medium">
                  {isLoading
                    ? 'Fetching Intel...'
                    : briefing
                    ? "Today's Threat Briefing"
                    : "Get Today's Briefing"}
                </span>
                {isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-4">
              {briefing && (
                <div className="space-y-4">
                  <Markdown content={briefing} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
