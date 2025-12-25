'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Check, X, AlertCircle, Loader } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface Exchange {
  id: number;
  skill_id?: number;
  skill?: { title: string; id: number };
  teacher_id?: number;
  learner_id?: number;
  learner?: { name: string; avatar_url?: string; id: number };
  teacher?: { name: string; avatar_url?: string; id: number };
  status: string;
}

const ExchangeCard = ({ exchange, currentUserId, onAction }: { exchange: Exchange; currentUserId?: number; onAction: (id: number, action: string) => Promise<void> }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isIncoming = exchange.learner_id !== currentUserId;
  const otherUser = isIncoming ? exchange.learner : exchange.teacher;

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      await onAction(exchange.id, action);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-headline">{exchange.skill?.title || 'Unknown Skill'}</CardTitle>
        <CardDescription>With {otherUser?.name || 'Unknown'}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            {otherUser?.avatar_url && <AvatarImage src={otherUser.avatar_url} alt={otherUser.name} />}
            <AvatarFallback>{otherUser?.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{otherUser?.name || 'Unknown'}</span>
        </div>
        <Badge variant="secondary" className="capitalize">{exchange.status}</Badge>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end flex-wrap">
        {isIncoming && exchange.status === 'pending' && (
          <>
            <Button size="sm" onClick={() => handleAction('accept')} disabled={isLoading}>
              <Check className="mr-2 h-4 w-4" /> Accept
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleAction('cancel')} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" /> Decline
            </Button>
          </>
        )}
        {exchange.status !== 'pending' && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/messages?exchangeId=${exchange.id}`}>
              <MessageSquare className="mr-2 h-4 w-4" /> Message
            </Link>
          </Button>
        )}
        {(exchange.status === 'pending' || exchange.status === 'accepted') && !isIncoming && (
          <Button size="sm" variant="outline" onClick={() => handleAction('cancel')} disabled={isLoading}>
            Cancel Request
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default function ExchangesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      fetchExchanges();
    }
  }, [user, isAuthenticated, authLoading, router]);

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

  const handleAction = async (exchangeId: number, action: string) => {
    try {
      const endpoint = `/exchanges/${exchangeId}/${action}`;
      const response = await apiClient.post(endpoint);
      
      if (response.success) {
        toast({ title: 'Success', description: `Exchange ${action}ed successfully` });
        fetchExchanges(); // Refresh list
      } else {
        toast({ 
          title: 'Error',
          description: response.message || `Failed to ${action} exchange`,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Action error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || `Failed to ${action} exchange`,
        variant: 'destructive'
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-headline mb-4">Not Authenticated</p>
            <p className="text-muted-foreground mb-6">Please log in to manage your skill exchanges.</p>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ongoingExchanges = exchanges.filter((e: Exchange) => e.status === 'accepted');
  const requestedExchanges = exchanges.filter((e: Exchange) => e.status === 'pending');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline"><span>My Exchanges</span></h1>
        <p className="text-muted-foreground"><span>Keep track of your skill swaps and requests.</span></p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ongoing">Ongoing ({ongoingExchanges.length})</TabsTrigger>
            <TabsTrigger value="requests">Requests ({requestedExchanges.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="ongoing">
            <div className="space-y-4 mt-4">
              {ongoingExchanges.length > 0 ? (
                ongoingExchanges.map(exchange => (
                  <ExchangeCard 
                    key={exchange.id} 
                    exchange={exchange} 
                    currentUserId={user?.id}
                    onAction={handleAction}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-8">
                    <p className="text-muted-foreground">No ongoing exchanges yet. Start by browsing skills!</p>
                    <Button asChild className="mt-4">
                      <Link href="/skills">Browse Skills</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          <TabsContent value="requests">
            <div className="space-y-4 mt-4">
              {requestedExchanges.length > 0 ? (
                requestedExchanges.map(exchange => (
                  <ExchangeCard 
                    key={exchange.id} 
                    exchange={exchange} 
                    currentUserId={user?.id}
                    onAction={handleAction}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-8">
                    <p className="text-muted-foreground">No pending requests.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}