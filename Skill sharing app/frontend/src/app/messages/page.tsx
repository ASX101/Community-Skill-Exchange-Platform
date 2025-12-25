'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, AlertCircle, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  sender?: { name: string; avatar_url?: string };
  receiver?: { name: string; avatar_url?: string };
}

export default function MessagesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [exchanges, setExchanges] = useState<any[]>([]);
  const [selectedExchangeId, setSelectedExchangeId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      const exchangeId = searchParams.get('exchangeId');
      if (exchangeId) {
        setSelectedExchangeId(parseInt(exchangeId));
      }
      fetchExchanges();
    }
  }, [user, isAuthenticated, authLoading, router, searchParams]);

  useEffect(() => {
    if (selectedExchangeId) {
      fetchMessages();
    }
  }, [selectedExchangeId]);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/exchanges');
      if (response.success) {
        // Merge both learner and teacher exchanges into a single array
        const data = response.data || {};
        const allExchanges = [
          ...(data.learner_exchanges || []),
          ...(data.teacher_exchanges || [])
        ];
        setExchanges(allExchanges);
        
        if (allExchanges.length > 0 && !selectedExchangeId) {
          setSelectedExchangeId(allExchanges[0].id);
        }
      } else {
        toast({ 
          title: 'Error', 
          description: response.message || 'Failed to load exchanges', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Failed to fetch exchanges:', error);
      toast({ title: 'Error', description: 'Failed to load exchanges', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedExchangeId) return;
    
    try {
      const response = await apiClient.get(`/messages/exchange/${selectedExchangeId}`);
      if (response.success) {
        setMessages(response.data || []);
      } else {
        toast({ 
          title: 'Error', 
          description: response.message || 'Failed to load messages', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast({ title: 'Error', description: 'Failed to load messages', variant: 'destructive' });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedExchangeId) {
      toast({ title: 'Error', description: 'Please select an exchange', variant: 'destructive' });
      return;
    }

    if (!messageInput.trim()) {
      return;
    }

    setIsSending(true);
    try {
      const response = await apiClient.post('/messages', {
        exchange_id: selectedExchangeId,
        content: messageInput,
        // No need to send receiver_id - backend will auto-detect
      });

      if (response.success) {
        setMessageInput('');
        fetchMessages(); // Refresh messages
        toast({ title: 'Success', description: 'Message sent!' });
      } else {
        toast({ 
          title: 'Error',
          description: response.message || 'Failed to send message',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-headline mb-4">Not Authenticated</p>
            <p className="text-muted-foreground mb-6">Please log in to access messages.</p>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedExchange = exchanges.find(e => e.id === selectedExchangeId);
  const filteredExchanges = exchanges.filter(exchange =>
    exchange.skill?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exchange.learner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exchange.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOtherUser = () => {
    if (!selectedExchange) return null;
    return selectedExchange.learner_id === user?.id ? selectedExchange.teacher : selectedExchange.learner;
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 max-w-6xl mx-auto">
      {/* Exchanges List */}
      <Card className="w-80 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-headline mb-2">My Exchanges</h2>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader className="animate-spin h-6 w-6" />
            </div>
          ) : filteredExchanges.length > 0 ? (
            <div className="p-2">
              {filteredExchanges.map((exchange) => {
                const other = exchange.learner_id === user?.id ? exchange.teacher : exchange.learner;
                return (
                  <button
                    key={exchange.id}
                    onClick={() => setSelectedExchangeId(exchange.id)}
                    className={cn(
                      'w-full p-3 rounded-md text-left mb-2 transition-colors text-sm',
                      selectedExchangeId === exchange.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <p className="font-semibold truncate">{exchange.skill?.title}</p>
                    <p className="text-xs opacity-75 truncate">{other?.name}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p>No exchanges</p>
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col">
        {selectedExchange ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                {getOtherUser()?.avatar_url && (
                  <AvatarImage src={getOtherUser()?.avatar_url} alt={getOtherUser()?.name} />
                )}
                <AvatarFallback>{getOtherUser()?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{getOtherUser()?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedExchange.skill?.title}</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 pr-4">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2',
                        msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.sender_id !== user?.id && (
                        <Avatar className="h-8 w-8">
                          {msg.sender?.avatar_url && (
                            <AvatarImage src={msg.sender.avatar_url} alt={msg.sender?.name} />
                          )}
                          <AvatarFallback>{msg.sender?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'max-w-xs px-4 py-2 rounded-lg',
                          msg.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No messages yet</p>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={isSending}
              />
              <Button type="submit" size="icon" disabled={isSending}>
                {isSending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select an exchange to message</p>
          </div>
        )}
      </Card>
    </div>
  );
}