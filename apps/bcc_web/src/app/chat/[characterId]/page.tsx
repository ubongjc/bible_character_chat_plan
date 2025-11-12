'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, ArrowLeft, AlertTriangle, BookOpen, Star } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  description: string;
  alignment: string;
  enable_deception_flags: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'character';
  text: string;
  citations?: string[];
  flags?: { deceptionRisk?: boolean };
  character_name?: string;
}

export default function ChatPage() {
  const params = useParams();
  const characterId = params.characterId as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [currentCitations, setCurrentCitations] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCharacter();
    createThread();
  }, [characterId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCharacter = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/characters/${characterId}`
      );
      const data = await response.json();
      setCharacter(data.character);
    } catch (error) {
      console.error('Failed to fetch character:', error);
    }
  };

  const createThread = async () => {
    try {
      const token = localStorage.getItem('token') || 'test-token';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          characterIds: [characterId],
          storeTranscript: true,
        }),
      });

      const data = await response.json();
      setThreadId(data.thread.id);
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !threadId || isStreaming) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message immediately
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userMessage,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Start streaming response
    setIsStreaming(true);
    let streamedText = '';
    const streamedCitations: string[] = [];

    try {
      const token = localStorage.getItem('token') || 'test-token';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          threadId,
          characterId,
          text: userMessage,
          language: 'en',
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Create placeholder message for streaming
      const streamMessageId = `stream-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: streamMessageId,
          role: 'character',
          text: '',
          character_name: character?.name,
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'content') {
                streamedText += data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamMessageId ? { ...msg, text: streamedText } : msg
                  )
                );
              } else if (data.type === 'citation') {
                streamedCitations.push(data.citation);
                setCurrentCitations(streamedCitations);
              } else if (data.type === 'complete') {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamMessageId
                      ? {
                          ...msg,
                          id: data.messageId,
                          citations: streamedCitations,
                          flags: data.flags,
                        }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'character',
          text: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    const text = message.text;

    // Replace citations with clickable links
    const renderTextWithCitations = (text: string) => {
      const citationPattern = /\[([^\]]+)\]/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = citationPattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(
          <button
            key={match.index}
            className="citation"
            onClick={() => {
              setShowSources(true);
              setCurrentCitations([match[1]]);
            }}
          >
            [{match[1]}]
          </button>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
      }

      return parts;
    };

    return (
      <div key={message.id} className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={isUser ? 'message-user' : 'message-character'}>
          {!isUser && message.character_name && (
            <div className="mb-1 text-xs font-semibold opacity-70">{message.character_name}</div>
          )}
          <div className="whitespace-pre-wrap">{renderTextWithCitations(text)}</div>

          {message.flags?.deceptionRisk && (
            <div className="deception-flag mt-2">
              <AlertTriangle className="h-3 w-3" />
              <span>Deception Risk - Educational Context Available</span>
            </div>
          )}

          {message.citations && message.citations.length > 0 && (
            <button
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setShowSources(true);
                setCurrentCitations(message.citations || []);
              }}
            >
              <BookOpen className="h-3 w-3" />
              {message.citations.length} source{message.citations.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!character) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Link href="/directory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{character.name}</h1>
            <p className="text-xs text-muted-foreground">{character.description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSources(!showSources)}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Sources
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-3xl">
            {character.alignment === 'antagonist' && (
              <Card className="mb-4 border-destructive bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-destructive">Educational Notice</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This character represents an antagonistic figure from Scripture. Responses
                      may include deceptive or problematic content, which will be clearly
                      flagged with educational context.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {messages.map((message) => renderMessage(message))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Sources Sidebar */}
        {showSources && (
          <div className="w-80 border-l bg-muted/30 p-4 overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Sources</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSources(false)}>
                Close
              </Button>
            </div>
            <div className="space-y-4">
              {currentCitations.map((citation, index) => (
                <Card key={index} className="p-3">
                  <h3 className="mb-2 font-semibold text-sm">{citation}</h3>
                  <p className="text-sm text-muted-foreground">
                    Citation content would be loaded here from the API.
                  </p>
                </Card>
              ))}
              {currentCitations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Click on citations in messages to view source texts.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-2">
            <Input
              placeholder={`Ask ${character.name} a question...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isStreaming}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isStreaming || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            All responses are educational and backed by Scripture citations.
          </p>
        </div>
      </div>
    </div>
  );
}
