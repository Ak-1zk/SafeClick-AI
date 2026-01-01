'use client';

import 'regenerator-runtime/runtime';
import React, { useEffect, useRef, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {
  Send,
  MessageSquare,
  User,
  Bot,
  Loader2,
  Mic,
  Paperclip,
  XCircle,
  MicOff,
} from 'lucide-react';

import type { ChatMessage } from '@/app/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface ChatbotProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, photoDataUri?: string) => void;
  isBotReplying: boolean;
}

export default function Chatbot({
  messages,
  onSendMessage,
  isBotReplying,
}: ChatbotProps) {
  const [input, setInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  /* ---------------- CLIENT CHECK ---------------- */
  useEffect(() => {
    setIsClient(true);
  }, []);

  /* ---------------- SPEECH TO TEXT ---------------- */
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    setInput(transcript);
  }, [transcript]);

  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true });

  const stopListening = () => SpeechRecognition.stopListening();

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    const viewport =
      scrollAreaRef.current?.querySelector(
        'div[data-radix-scroll-area-viewport]'
      );
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isBotReplying]);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !uploadedImage) return;

    onSendMessage(input.trim(), uploadedImage || undefined);
    setInput('');
    setUploadedImage(null);
    resetTranscript();
  };

  /* ---------------- IMAGE UPLOAD ---------------- */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (isClient && !browserSupportsSpeechRecognition) {
    console.warn("Browser doesn't support speech recognition.");
  }

  /* ---------------- UI ---------------- */
  return (
    <Card className="glass-card flex h-[70vh] flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <MessageSquare className="h-6 w-6 text-primary" />
          SafeClick AI
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                )}
              >
                {/* Assistant Avatar */}
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    'max-w-xs rounded-lg px-4 py-2 md:max-w-md',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}
                >
                  {message.photoDataUri && (
                    <Image
                      src={message.photoDataUri}
                      alt="Uploaded"
                      width={200}
                      height={200}
                      className="mb-2 rounded-md"
                    />
                  )}

                  {/* ✅ MARKDOWN FOR AI, PLAIN TEXT FOR USER */}
                  {message.role === 'assistant' ? (
                    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                </div>

                {/* User Avatar */}
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Bot typing indicator */}
            {isBotReplying && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-secondary rounded-lg px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm italic">
                    SafeClick AI is thinking…
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t pt-4">
        {uploadedImage && (
          <div className="relative">
            <Image
              src={uploadedImage}
              alt="Preview"
              width={80}
              height={80}
              className="rounded-md border"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6"
              onClick={() => setUploadedImage(null)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              listening
                ? 'Listening…'
                : 'Ask about phishing, malware, or links…'
            }
            disabled={isBotReplying}
          />

          <TooltipProvider>
            {isClient && browserSupportsSpeechRecognition && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant={listening ? 'destructive' : 'outline'}
                    onClick={listening ? stopListening : startListening}
                  >
                    {listening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {listening ? 'Stop listening' : 'Use voice'}
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach image</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <Button
            type="submit"
            size="icon"
            disabled={isBotReplying || (!input.trim() && !uploadedImage)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
