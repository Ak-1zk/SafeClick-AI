'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getDailyBriefing } from '@/app/actions';
import { Loader2, Newspaper } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

// A simple markdown-to-HTML converter
const Markdown = ({ content }: { content: string }) => {
    const html = content
      .replace(/### (.*)/g, '<h3 class="text-md font-semibold font-headline text-primary mb-2 mt-4">$1</h3>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground/90">$1</strong>')
      .replace(/---/g, '<hr class="my-4 border-white/10" />');
  
    return <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-invert text-sm text-muted-foreground leading-relaxed" />;
  };

export default function DailyBriefing() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchBriefing = async () => {
    if (briefing) return; // Don't re-fetch if already loaded
    setIsLoading(true);
    const result = await getDailyBriefing();
    setBriefing(result.briefing);
    setIsLoading(false);
  };

  return (
    <Card className="glass-card">
        <CardHeader>
            <CardTitle className='flex items-center gap-2 font-headline'>
                <Newspaper className="h-6 w-6 text-primary" />
                SafeClick AI Daily Briefing
            </CardTitle>
            <CardDescription>
                Get your daily summary of the latest cybersecurity threats.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full" onValueChange={handleFetchBriefing}>
                <AccordionItem value="item-1">
                    <AccordionTrigger disabled={isLoading}>
                         <div className='flex justify-between items-center w-full'>
                             <span className='text-base font-medium'>
                                {isLoading ? 'Fetching Intel...' : (briefing ? 'Today\'s Threat Briefing' : 'Get Today\'s Briefing')}
                             </span>
                             {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
