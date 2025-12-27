'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader, BookmarkX } from 'lucide-react';
import SkillCard from '@/components/skill-card';

interface Skill {
  id: number;
  title: string;
  description: string;
  category: any;
  teacher: any;
  rating: number;
  total_reviews: number;
  image_url?: string;
}

export default function BookmarksPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [bookmarks, setBookmarks] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch bookmarks
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarks();
    }
  }, [isAuthenticated]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/bookmarks');

      if (response.success) {
        setBookmarks(response.data || []);
      } else {
        setError(response.message || 'Failed to load bookmarks');
        setBookmarks([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch bookmarks:', err);
      setError(err.message || 'Failed to load bookmarks');
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle remove bookmark
  const handleRemoveBookmark = async (skillId: number) => {
    try {
      const response = await apiClient.delete(`/bookmarks/${skillId}`);

      if (response.success) {
        setBookmarks(bookmarks.filter(skill => skill.id !== skillId));
        toast({
          title: 'Success',
          description: 'Bookmark removed'
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to remove bookmark',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Remove bookmark error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove bookmark',
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
            <p className="text-muted-foreground mb-6">Please log in to view your bookmarks.</p>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-12">
        <Loader className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">My Bookmarks</CardTitle>
          <p className="text-muted-foreground mt-2">
            {bookmarks.length} skill{bookmarks.length !== 1 ? 's' : ''} bookmarked
          </p>
        </CardHeader>
      </Card>

      {error && (
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {bookmarks.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
            <BookmarkX className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-headline mb-4">No Bookmarks Yet</p>
            <p className="text-muted-foreground mb-6">
              You haven't bookmarked any skills yet. Start exploring!
            </p>
            <Button asChild>
              <Link href="/skills">Browse Skills</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {bookmarks.map((skill) => (
            <div key={skill.id} className="relative group">
              <Link href={`/skills/${skill.id}`}>
                <SkillCard
                  id={skill.id}
                  title={skill.title}
                  user={skill.teacher?.name || 'Unknown'}
                  category={skill.category?.name || 'Uncategorized'}
                  rating={skill.rating || 0}
                  reviews={skill.total_reviews || 0}
                  imageUrl={skill.image_url}
                />
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveBookmark(skill.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <BookmarkX className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
