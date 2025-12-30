'use client';

import 'regenerator-runtime/runtime';
import React, { useEffect, useRef, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Send, MessageSquare, User, Bot, Loader2, Mic, Paperclip, XCircle, MicOff, Volume2 } from 'lucide-react';
import type { ChatMessage } from '@/app/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { textToSpeech } from '../../app/actions';

interface ChatbotProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, photoDataUri?: string) => void;
  isBotReplying: boolean;
}

export default function Chatbot({ messages, onSendMessage, isBotReplying }: ChatbotProps) {
  const [input, setInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [spokenMessageIds, setSpokenMessageIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);


  useEffect(() => {
    setIsClient(true);
  }, []);

  const { transcript, listening, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    setInput(transcript);
  }, [transcript]);
  
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isBotReplying]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'model' && !isBotReplying && !spokenMessageIds.has(lastMessage.id)) {
      const getAudio = async () => {
        const { media } = await textToSpeech(lastMessage.content);
        if (media) {
            setAudioSrc(media);
            setSpokenMessageIds(prev => new Set(prev).add(lastMessage.id));
        }
      };
      getAudio();
    }
  }, [messages, isBotReplying]);
  
  useEffect(() => {
      if (audioSrc && audioRef.current) {
          audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
  }, [audioSrc]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || uploadedImage) {
      onSendMessage(input.trim(), uploadedImage || undefined);
      setInput('');
      setUploadedImage(null);
      resetTranscript();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setUploadedImage(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startListening = () => SpeechRecognition.startListening({ continuous: true });
  const stopListening = () => SpeechRecognition.stopListening();
  
  if (isClient && !browserSupportsSpeechRecognition) {
    console.warn("Browser doesn't support speech recognition.");
  }
  
  return (
    <Card className="glass-card flex h-[70vh] flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline font-bold">
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
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/20"><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
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
                      alt="Uploaded context"
                      width={200}
                      height={200}
                      className="mb-2 rounded-md"
                    />
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/20"><User className="h-4 w-4 text-primary" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isBotReplying && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8 border-2 border-primary/50">
                        <AvatarFallback className="bg-primary/20"><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-secondary rounded-lg px-4 py-3 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground italic">SafeClick AI is thinking...</span>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t border-white/10 pt-4">
        {uploadedImage && (
          <div className="relative">
            <Image src={uploadedImage} alt="Preview" width={80} height={80} className="rounded-md border border-white/20" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive"
              onClick={() => setUploadedImage(null)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening..." : "Ask about phishing, malware, or this URL..."}
            disabled={isBotReplying}
            autoComplete="off"
            className="bg-background/50"
          />
          <TooltipProvider>
            {isClient && browserSupportsSpeechRecognition && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" size="icon" variant={listening ? "destructive" : "outline"} onClick={listening ? stopListening : startListening} disabled={isBotReplying}>
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{listening ? 'Stop listening' : 'Use voice'}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" size="icon" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isBotReplying}>
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach image</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          
          <Button type="submit" size="icon" disabled={isBotReplying || (!input.trim() && !uploadedImage)} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
         {audioSrc && <audio ref={audioRef} src={audioSrc} onEnded={() => setAudioSrc(null)} className="hidden" />}
      </CardFooter>
    </Card>
  );
}
